<?php

namespace Kanboard\Plugin\DhtmlGantt\Formatter;

use Kanboard\Core\Base;
use DateTime;

/**
 * Gantt Data Formatter
 * Transforms Kanboard task data into DHTMLX Gantt expected format
 *
 * @package Kanboard\Plugin\DhtmlGantt\Formatter
 * @author  USC Team B
 */
class GanttDataFormatter extends Base
{
    /**
     * Format tasks for DHTMLX Gantt
     * Expected format: {"data": [...], "links": [...]}
     *
     * @param array $tasks Kanboard tasks array
     * @return array DHTMLX formatted tasks
     */
    public function formatTasks(array $tasks)
    {
        $formatted_tasks = [];
        
        foreach ($tasks as $task) {
            $formatted_tasks[] = $this->formatSingleTask($task);
        }
        
        return $formatted_tasks;
    }
    
    /**
     * Format a single task for DHTMLX Gantt
     *
     * @param array $task Kanboard task
     * @return array DHTMLX formatted task
     */
    private function formatSingleTask(array $task)
    {
        // Handle start date - convert Unix timestamp to YYYY-MM-DD format
        $start_date = $this->formatTaskDate($task, 'start');
        
        // Calculate duration in days
        $duration = $this->calculateTaskDuration($task);
        
        // Calculate progress (0.0 to 1.0)
        $progress = $this->calculateTaskProgress($task);
        
        return [
            'id' => (int) $task['id'],
            'text' => $task['title'],
            'start_date' => $start_date,
            'duration' => $duration,
            'progress' => $progress,
            'parent' => 0  // Kanboard doesn't have hierarchical tasks in this context
        ];
    }
    
    /**
     * Format task date from Kanboard timestamp
     *
     * @param array $task
     * @param string $type 'start' or 'end'
     * @return string Formatted date in YYYY-MM-DD format
     */
    private function formatTaskDate(array $task, $type = 'start')
    {
        if ($type === 'start' && !empty($task['date_started'])) {
            // Use actual start date if available
            return date('Y-m-d', $task['date_started']);
        } elseif (!empty($task['date_due'])) {
            // If no start date but has due date, calculate backwards from due date
            if ($type === 'start') {
                // Default to 1 day before due date if no start date
                $start_timestamp = $task['date_due'] - (24 * 60 * 60); // 1 day before
                return date('Y-m-d', $start_timestamp);
            } else {
                return date('Y-m-d', $task['date_due']);
            }
        } else {
            // No dates set - use current date as default
            if ($type === 'start') {
                return date('Y-m-d');
            } else {
                // Default end date is 1 day after start
                return date('Y-m-d', strtotime('+1 day'));
            }
        }
    }
    
    /**
     * Calculate task duration in days
     *
     * @param array $task
     * @return int Duration in days (minimum 1)
     */
    private function calculateTaskDuration(array $task)
    {
        if (!empty($task['date_started']) && !empty($task['date_due'])) {
            // Calculate actual duration from start to due date
            $start = new DateTime();
            $start->setTimestamp($task['date_started']);
            
            $end = new DateTime();
            $end->setTimestamp($task['date_due']);
            
            $diff = $end->diff($start);
            return max(1, $diff->days + 1); // At least 1 day, inclusive of both dates
        } elseif (!empty($task['date_due'])) {
            // Only due date available - default to 1 day duration
            return 1;
        } else {
            // No dates - default to 1 day
            return 1;
        }
    }
    
    /**
     * Calculate task progress (0.0 to 1.0)
     *
     * @param array $task
     * @return float Progress value between 0.0 and 1.0
     */
    private function calculateTaskProgress(array $task)
    {
        // Method 1: Use time spent vs estimated time if available
        if (!empty($task['time_spent']) && !empty($task['time_estimated'])) {
            return min(1.0, (float)$task['time_spent'] / (float)$task['time_estimated']);
        }
        
        // Method 2: Use Kanboard score if available (assuming 0-100 scale)
        if (isset($task['score']) && $task['score'] > 0) {
            return min(1.0, (float)$task['score'] / 100.0);
        }
        
        // Method 3: Estimate progress based on column position in workflow
        // Temporarily disabled due to data type issues - will return 0.0
        // TODO: Re-implement with proper Kanboard column model integration
        
        // Default: no progress
        return 0.0;
    }
    
    /**
     * Format task links/dependencies for DHTMLX Gantt
     *
     * @param array $links Raw Kanboard task links
     * @return array DHTMLX formatted links
     */
    public function formatLinks(array $links)
    {
        $formatted_links = [];
        $link_counter = 1;
        
        foreach ($links as $link) {
            $formatted_link = $this->formatSingleLink($link, $link_counter);
            if ($formatted_link) {
                $formatted_links[] = $formatted_link;
                $link_counter++;
            }
        }
        
        return $formatted_links;
    }
    
    /**
     * Format a single task link for DHTMLX Gantt
     *
     * @param array $link Raw Kanboard link
     * @param int $counter Unique ID counter
     * @return array|null DHTMLX formatted link or null if invalid
     */
    private function formatSingleLink(array $link, $counter)
    {
        // Determine source and target based on Kanboard link type
        $source_id = null;
        $target_id = null;
        $link_type = "0"; // Default to Finish-to-Start
        
        if ($link['link_id'] == 2) {
            // "blocks" relationship: source blocks target
            $source_id = (int) $link['source_task_id'];
            $target_id = (int) $link['target_task_id'];
        } elseif ($link['link_id'] == 3) {
            // "is blocked by" relationship: target is blocked by source
            $source_id = (int) $link['target_task_id'];
            $target_id = (int) $link['source_task_id'];
        } else {
            // Skip non-dependency links
            return null;
        }
        
        // Ensure we have valid task IDs
        if (!$source_id || !$target_id || $source_id == $target_id) {
            return null;
        }
        
        return [
            'id' => $counter,
            'source' => $source_id,
            'target' => $target_id,
            'type' => $link_type  // "0" = Finish-to-Start dependency
        ];
    }
} 