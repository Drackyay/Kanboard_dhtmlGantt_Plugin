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
        
        return array(
            'id' => $task['id'],
            'text' => $task['title'],
            'start_date' => $start_date,
            'duration' => $duration,
            'progress' => $this->calculateProgress($task),
            'priority' => $this->mapPriority($task['priority']),
            'color' => $this->getTaskColor($task),
            'owner_id' => $task['owner_id'],
            'category_id' => $task['category_id'],
            'swimlane_id' => $task['swimlane_id'],
            'column_id' => $task['column_id'],
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
     * Format task dependencies/links
     *
     * @param array $tasks
     * @return array
     */
    private function formatLinks(array $tasks)
    {
        $links = array();
        
        // Get task dependencies from Kanboard
        // Note: This would need to be implemented based on your dependency system
        // For now, return empty array
        
        return $links;
    }
}