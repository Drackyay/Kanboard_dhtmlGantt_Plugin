<?php

namespace Kanboard\Plugin\DhtmlGantt\Formatter;

use Kanboard\Core\Base;

/**
 * Project Gantt Formatter
 *
 * @package Kanboard\Plugin\DhtmlGantt\Formatter
 * @author  Your Name
 */
class ProjectGanttFormatter extends Base
{
    /**
     * Format tasks for DHtmlX Gantt
     *
     * @param array $tasks
     * @return array
     */
    public function formatTasks(array $tasks)
    {
        $gantt_tasks = array();
        $gantt_links = array();
        
        foreach ($tasks as $task) {
            $gantt_tasks[] = $this->formatTask($task);
        }
        
        // Get task dependencies/links
        $gantt_links = $this->formatLinks($tasks);
        
        return array(
            'data' => $gantt_tasks,
            'links' => $gantt_links
        );
    }

    /**
     * Format a single task for DHtmlX Gantt
     *
     * @param array $task
     * @return array
     */
    private function formatTask(array $task)
    {
        $start_date = !empty($task['date_started']) ? 
            date('Y-m-d H:i', $task['date_started']) : 
            date('Y-m-d H:i');
            
        $duration = $this->calculateDuration($task);
        
        // Get assignee name
        $assignee = '';
        if (!empty($task['owner_id'])) {
            $user = $this->userModel->getById($task['owner_id']);
            if ($user) {
                $assignee = $user['username'];
            }
        }
        
        // Check if task is a milestone
        $metadata = $this->taskMetadataModel->getAll($task['id']);
        $isMilestone = !empty($metadata['is_milestone']) && $metadata['is_milestone'] === '1';
        
        return array(
            'id' => $task['id'],
            'text' => $task['title'],
            'start_date' => $start_date,
            'duration' => $duration,
            'progress' => $this->calculateProgress($task),
            'priority' => $this->mapPriority($task['priority']),
            'color' => $this->getTaskColor($task),
            'owner_id' => $task['owner_id'],
            'assignee' => $assignee,
            'category_id' => $task['category_id'],
            'swimlane_id' => $task['swimlane_id'],
            'column_id' => $task['column_id'],
            'type' => $isMilestone ? 'milestone' : 'task',
            'open' => true,
            'readonly' => $this->isReadonly($task),
        );
    }

    /**
     * Calculate task duration in days
     *
     * @param array $task
     * @return int
     */
    private function calculateDuration(array $task)
    {
        if (empty($task['date_started']) || empty($task['date_due'])) {
            return 1; // Default 1 day
        }
        
        $start = new \DateTime();
        $start->setTimestamp($task['date_started']);
        
        $end = new \DateTime();
        $end->setTimestamp($task['date_due']);
        
        $diff = $end->diff($start);
        return max(1, $diff->days + 1); // At least 1 day
    }

    /**
     * Calculate task progress percentage
     *
     * @param array $task
     * @return float
     */
    private function calculateProgress(array $task)
    {
        // Calculate based on completed subtasks or time spent
        if (!empty($task['time_spent']) && !empty($task['time_estimated'])) {
            return min(1.0, $task['time_spent'] / $task['time_estimated']);
        }
        
        // Default progress based on column position
        $columns = $this->columnModel->getList($task['project_id']);
        $column_position = 0;
        $total_columns = count($columns);
        
        foreach ($columns as $index => $column) {
            if ($column['id'] == $task['column_id']) {
                $column_position = $index + 1;
                break;
            }
        }
        
        return $total_columns > 0 ? ($column_position / $total_columns) : 0;
    }

    /**
     * Map Kanboard priority to DHtmlX format
     *
     * @param int $priority
     * @return string
     */
    private function mapPriority($priority)
    {
        switch ($priority) {
            case 3: return 'high';
            case 2: return 'medium';
            case 1: return 'low';
            default: return 'normal';
        }
    }

    /**
     * Get task color based on category or priority
     *
     * @param array $task
     * @return string
     */
    private function getTaskColor(array $task)
    {
        // Use category color if available
        if (!empty($task['category_id'])) {
            $category = $this->categoryModel->getById($task['category_id']);
            if (!empty($category['color_id'])) {
                return $this->colorModel->getColorProperties($category['color_id'])['background'];
            }
        }
        
        // Default colors based on priority
        switch ($task['priority']) {
            case 3: return '#e74c3c'; // High priority - red
            case 2: return '#f39c12'; // Medium priority - orange  
            case 1: return '#3498db'; // Low priority - blue
            default: return '#95a5a6'; // Normal - gray
        }
    }

    /**
     * Check if task should be readonly
     *
     * @param array $task
     * @return bool
     */
    private function isReadonly(array $task)
    {
        // Make completed tasks readonly
        return $task['is_active'] == 0;
    }

    /**
     * Format task dependencies/links (alias-free for PicoDb/SQLite)
     *
     * @param array $tasks
     * @return array
     */
    private function formatLinks(array $tasks)
    {
        $links = array();
        if (empty($tasks)) {
            return $links;
        }

        // Only include links among the tasks we're rendering
        $taskIds   = array_map(function ($t) { return (int) $t['id']; }, $tasks);
        $taskIdSet = array_flip($taskIds);

        // Query internal links (no aliases)
        $rows = $this->db->table('task_has_links')
            ->join('links', 'id', 'link_id') // links.id = task_has_links.link_id
            ->columns(
                'task_has_links.id',
                'links.label',
                'task_has_links.task_id',
                'task_has_links.opposite_task_id'
            )
            ->in('task_has_links.task_id', $taskIds)
            ->findAll();

        foreach ($rows as $r) {
            // PicoDb sometimes strips table qualifiers — support both forms
            $left  = (int) ( $r['task_id']          ?? ($r['task_has_links.task_id'] ?? 0) );
            $right = (int) ( $r['opposite_task_id'] ?? ($r['task_has_links.opposite_task_id'] ?? 0) );
            $label =        ( $r['label']           ?? ($r['links.label'] ?? '') );
            $rowId = (int) ( $r['id']               ?? ($r['task_has_links.id'] ?? 0) );

            if ($left === 0 || $right === 0) {
                continue;
            }
            if (!isset($taskIdSet[$right])) {
                continue;
            }

            // Map only true dependencies (Finish-to-Start)
            if ($label === 'blocks') {
                $source = $left;   // A blocks B → A → B
                $target = $right;
            } elseif ($label === 'is blocked by') {
                $source = $right;  // invert
                $target = $left;
            } else {
                continue; // ignore non-dependency relations
            }

            $links[] = array(
                'id'     => $rowId,
                'source' => $source,
                'target' => $target,
                'type'   => '0', // DHTMLX Finish-to-Start
            );
        }

        return $links;
    }

}
