<?php

namespace Kanboard\Plugin\DhtmlGantt\Formatter;

use Kanboard\Core\Filter\FormatterInterface;
use Kanboard\Formatter\BaseFormatter;

/**
 * Task Gantt Formatter for DHtmlX Gantt
 *
 * @package  Kanboard\Plugin\DhtmlGantt\Formatter
 * @author   Your Development Team
 */
class TaskGanttFormatter extends BaseFormatter implements FormatterInterface
{
    /**
     * Local cache for project columns
     *
     * @access private
     * @var array
     */
    private $columns = array();

    private $links = [];

    private static $ids = [];

    /**
     * Apply formatter for DHtmlX Gantt
     *
     * @access public
     * @return array
     */
    public function format()
    {
        $tasks = array();
        $links = array();

        foreach ($this->query->findAll() as $task) {

            // Skip tasks in Done column (filter by column name, not task status)
            if (isset($task['column_name']) && strcasecmp($task['column_name'], 'Done') === 0) {
                continue;
            }

            $formattedTask = $this->formatTask($task);
            
            if (!in_array($formattedTask['id'], self::$ids)) {
                $tasks[] = $formattedTask;
                self::$ids[] = $formattedTask['id'];
            }

            // Handle subtasks
            $subTasks = $this->subtaskModel->getAll($task['id']);
            if (!empty($subTasks)) {
                $subtaskData = $this->formatSubTasks($subTasks, $task);
                $tasks = array_merge($tasks, $subtaskData);
            }
        }

        // Get task links for dependencies
        $links = $this->formatLinks();

        return array(
            'data' => $tasks,
            'links' => $links
        );
    }

    /**
     * Format a single task for DHtmlX Gantt
     *
     * @access private
     * @param  array  $task
     * @return array
     */
    private function formatTask(array $task)
    {
        if (!isset($this->columns[$task['project_id']])) {
            $this->columns[$task['project_id']] = $this->columnModel->getList($task['project_id']);
        }

        $start = $task['date_started'] ?: time();
        $end = $task['date_due'] ?: ($start + 24 * 60 * 60); // Default to 1 day duration

        // Check if task is a milestone
        $metadata = $this->taskMetadataModel->getAll($task['id']);
        $isMilestone = !empty($metadata['is_milestone']) && $metadata['is_milestone'] === '1';
        
        // Override color for milestones to green
        $color = $isMilestone ? '#27ae60' : $this->getTaskColor($task);
        
        return array(
            'id' => $task['id'],
            'text' => $task['title'],
            'start_date' => date('Y-m-d H:i', $start),
            'end_date' => date('Y-m-d H:i', $end),
            'duration' => $this->calculateDuration($start, $end),
            'progress' => $this->calculateProgress($task),
            'priority' => $this->mapPriority($task['priority']),
            'color' => $color,
            'owner_id' => $task['owner_id'],
            'assignee' => $task['assignee_name'] ?: $task['assignee_username'],
            'column_title' => $task['column_name'],
            'category_id' => $task['category_id'],
            'link' => $this->helper->url->href('TaskViewController', 'show', array(
                'project_id' => $task['project_id'], 
                'task_id' => $task['id']
            )),
            'readonly' => $this->isReadonly($task),
            'type' => 'task', // Always use 'task' type to show as rectangular bar
            'is_milestone' => $isMilestone,
            'open' => true,
            'parent' => (int) ($this->resolveParentId((int)$task['id']) ?? 0),
        );
    }

    /**
     * Format subtasks
     *
     * @access private
     * @param  array  $subTasks
     * @param  array  $parentTask
     * @return array
     */
    private function formatSubTasks(array $subTasks, array $parentTask)
    {
        $formattedSubTasks = array();

        foreach ($subTasks as $subTask) {
            // Kanboard subtasks don't have due_date, use current time as fallback
            $due_date = isset($subTask['due_date']) ? $subTask['due_date'] : null;
            $start = $due_date ? $due_date - (3 * 24 * 60 * 60) : time();
            $end = $due_date ?: (time() + 24 * 60 * 60); // Default to 1 day duration

            $progress = $this->getSubtaskProgress($subTask);

            if (!in_array('subtask_' . $subTask['id'], self::$ids)) {
                $formattedSubTasks[] = array(
                    'id' => 'subtask_' . $subTask['id'],
                    'text' => $subTask['title'],
                    'start_date' => date('Y-m-d H:i', $start),
                    'end_date' => date('Y-m-d H:i', $end),
                    'duration' => $this->calculateDuration($start, $end),
                    'progress' => $progress / 100,
                    'parent' => $parentTask['id'],
                    'type' => 'task',
                    'color' => $this->getSubtaskColor($subTask),
                    'readonly' => $this->isSubtaskReadonly($subTask),
                    'link' => $this->helper->url->href('TaskViewController', 'show', array(
                        'project_id' => $parentTask['project_id'], 
                        'task_id' => $parentTask['id']
                    )),
                );

                self::$ids[] = 'subtask_' . $subTask['id'];
            }
        }

        return $formattedSubTasks;
    }

    /**
     * Calculate task duration in days
     *
     * @access private
     * @param  int $start
     * @param  int $end
     * @return int
     */
    private function calculateDuration($start, $end)
    {
        $diff = ceil(($end - $start) / (24 * 60 * 60));
        return max(1, $diff); // At least 1 day
    }

    /**
     * Calculate task progress percentage
     *
     * @access private
     * @param  array $task
     * @return float
     */
    private function calculateProgress(array $task)
    {
        if (!isset($this->columns[$task['project_id']])) {
            return 0;
        }

        return $this->taskModel->getProgress($task, $this->columns[$task['project_id']]) / 100;
    }

    /**
     * Get subtask progress
     *
     * @access private
     * @param  array $subtask
     * @return int
     */
    private function getSubtaskProgress(array $subtask)
    {
        switch ($subtask['status']) {
            case 0: return 0;   // Todo
            case 1: return 50;  // In progress
            case 2: return 100; // Done
            default: return 0;
        }
    }

    /**
     * Map Kanboard priority to string
     *
     * @access private
     * @param  int $priority
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
     * @access private
     * @param  array $task
     * @return string
     */
    private function getTaskColor(array $task)
    {
        if (!empty($task['color_id'])) {
            $colorProperties = $this->colorModel->getColorProperties($task['color_id']);
            return $colorProperties['background'];
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
     * Get subtask color
     *
     * @access private
     * @param  array $subtask
     * @return string
     */
    private function getSubtaskColor(array $subtask)
    {
        switch ($subtask['status']) {
            case 0: return '#bdc3c7'; // Todo - light gray
            case 1: return '#f39c12'; // In progress - orange
            case 2: return '#2ecc71'; // Done - green
            default: return '#ecf0f1';
        }
    }

    /**
     * Check if task should be readonly
     *
     * @access private
     * @param  array $task
     * @return bool
     */
    private function isReadonly(array $task)
    {
        return $task['is_active'] == 0;
    }

    /**
     * Check if subtask should be readonly
     *
     * @access private
     * @param  array $subtask
     * @return bool
     */
    private function isSubtaskReadonly(array $subtask)
    {
        return $subtask['status'] == 2; // Done
    }

    /**
     * Build taskId -> parentTaskId map using internal links
     * Parent is detected from link labels: "is a child of" / "is a parent of"
     *
     * @param int[] $taskIds
     * @return array<int,int|null>
     */
    private function buildParentMap(array $taskIds): array
    {
        if (empty($taskIds)) return [];

        $taskIdSet = array_flip($taskIds);
        $rows = $this->db->table('task_has_links')
            ->join('links', 'id', 'link_id') // links.id = task_has_links.link_id
            ->columns(
                'links.label',
                'task_has_links.task_id',
                'task_has_links.opposite_task_id'
            )
            ->in('task_has_links.task_id', $taskIds)
            ->findAll();

        $parent = [];

        foreach ($rows as $r) {
            $label = $r['label'] ?? ($r['links.label'] ?? '');
            $left  = (int)($r['task_id'] ?? ($r['task_has_links.task_id'] ?? 0));
            $right = (int)($r['opposite_task_id'] ?? ($r['task_has_links.opposite_task_id'] ?? 0));

            if ($label === 'is a child of') {
                // left (child) -> right (parent)
                if (isset($taskIdSet[$left])) $parent[$left] = $right;
            } elseif ($label === 'is a parent of') {
                // left (parent) -> right (child)
                if (isset($taskIdSet[$right])) $parent[$right] = $left;
            }
        }

        // tasks without an entry are top-level parents; represent as null
        foreach ($taskIds as $id) {
            if (!array_key_exists($id, $parent)) $parent[$id] = null;
        }

        return $parent;
    }

    /** Return true if an arrow between A and B is allowed per “same-level only” rules */
    private function sameLevelAllowed(?int $parentA, ?int $parentB): bool
    {
        // both are top-level parents
        if ($parentA === null && $parentB === null) return true;
        // both are children of the same parent
        if ($parentA !== null && $parentA === $parentB) return true;
        // otherwise, cross-level — block
        return false;
    }

    private function formatLinks()
    {
        $links = array();
    
        // Collect the task IDs that are in the current dataset
        $taskIds = array();
        foreach ($this->query->findAll() as $t) {
            $taskIds[] = (int) $t['id'];
        }
        if (empty($taskIds)) return $links;
    
        $taskIdSet  = array_flip($taskIds);
        $parentMap  = $this->buildParentMap($taskIds);
    
        // Pull dependency links (blocks / is blocked by)
        $rows = $this->db->table('task_has_links')
            ->join('links', 'id', 'link_id')
            ->columns(
                'task_has_links.id',
                'links.label',
                'task_has_links.task_id',
                'task_has_links.opposite_task_id'
            )
            ->in('task_has_links.task_id', $taskIds)
            ->findAll();
    
        foreach ($rows as $r) {
            $left   = (int) ( $r['task_id']          ?? ($r['task_has_links.task_id'] ?? 0) );
            $right  = (int) ( $r['opposite_task_id'] ?? ($r['task_has_links.opposite_task_id'] ?? 0) );
            $label  =        ( $r['label']           ?? ($r['links.label'] ?? '') );
            $rowId  = (int) ( $r['id']               ?? ($r['task_has_links.id'] ?? 0) );
    
            if ($left === 0 || $right === 0) continue;
            if (!isset($taskIdSet[$right]))   continue;
    
            // Map to FS
            if ($label === 'blocks') {
                $source = $left;  $target = $right;
            } elseif ($label === 'is blocked by') {
                $source = $right; $target = $left;
            } else {
                continue; // ignore non-dependency relations
            }
    
            // Enforce “same level only”: siblings or both top-level
            $parentA = $parentMap[$source] ?? null;
            $parentB = $parentMap[$target] ?? null;
            if (!$this->sameLevelAllowed($parentA, $parentB)) continue;
    
            $links[] = array(
                'id'     => $rowId,
                'source' => $source,
                'target' => $target,
                'type'   => '0', // FS
            );
        }
    
        return $links;
    }

    /**
     * Resolve a task's parent task id using internal links.
     * Returns int parent id, or null if top-level (no parent found).
     */
    private function resolveParentId(int $taskId): ?int
    {
        // Case 1: row says "task_id (child) is a child of opposite_task_id (parent)"
        $rows = $this->db->table('task_has_links')
            ->join('links', 'id', 'link_id')
            ->columns('links.label', 'task_has_links.task_id', 'task_has_links.opposite_task_id')
            ->eq('task_has_links.task_id', $taskId)
            ->findAll();

        foreach ($rows as $r) {
            $label = $r['label'] ?? ($r['links.label'] ?? '');
            if ($label === 'is a child of') {
                return (int) ($r['opposite_task_id'] ?? ($r['task_has_links.opposite_task_id'] ?? 0)) ?: null;
            }
        }

        // Case 2: inverse row says "task_id (parent) is a parent of opposite_task_id (child == current task)"
        $rows = $this->db->table('task_has_links')
            ->join('links', 'id', 'link_id')
            ->columns('links.label', 'task_has_links.task_id', 'task_has_links.opposite_task_id')
            ->eq('task_has_links.opposite_task_id', $taskId)
            ->findAll();

        foreach ($rows as $r) {
            $label = $r['label'] ?? ($r['links.label'] ?? '');
            if ($label === 'is a parent of') {
                return (int) ($r['task_id'] ?? ($r['task_has_links.task_id'] ?? 0)) ?: null;
            }
        }

        return null; // top-level if we didn't find a parent link
    }

    

}
