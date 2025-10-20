<?php

namespace Kanboard\Plugin\DhtmlGantt\Controller;

use Kanboard\Controller\BaseController;

/**
 * Gantt Data Controller
 * Provides clean JSON endpoints for DHTMLX Gantt integration
 *
 * @package Kanboard\Plugin\DhtmlGantt\Controller
 * @author  USC Team B
 */
class GanttController extends BaseController
{
    /**
     * Get Gantt data for a project in DHTMLX format
     * Endpoint: /gantt/json/:project_id
     * Optional filters: ?column_id=X&swimlane_id=Y
     *
     * @access public
     */
    public function data()
    {
        $project = $this->getProject();
        
        // Check permissions - user must have access to the project
        if (!$this->projectPermissionModel->isUserAllowed($project['id'], $this->userSession->getId())) {
            $this->response->status(403);
            return;
        }
        
        try {
            // Get filter parameters from query string
            $column_id = $this->request->getIntegerParam('column_id');
            $swimlane_id = $this->request->getIntegerParam('swimlane_id');
            
            // Get all active tasks for the project
            $tasks = $this->taskFinderModel->getAll($project['id'], 1); // 1 = active tasks only
            
            // Apply filters if provided
            $tasks = $this->applyFilters($tasks, $column_id, $swimlane_id);
            
            // Get task dependencies/links (only for filtered tasks)
            $links = $this->getTaskLinks($project['id'], $tasks);
            
            // Format data using the new formatter
            $formatter = new \Kanboard\Plugin\DhtmlGantt\Formatter\GanttDataFormatter($this->container);
            $gantt_tasks = $formatter->formatTasks($tasks);
            $gantt_links = $formatter->formatLinks($links);
            
            // Return DHTMLX Gantt expected format
            $this->response->json([
                'data' => $gantt_tasks,
                'links' => $gantt_links
            ]);
            
        } catch (Exception $e) {
            $this->logger->error('Gantt data error: ' . $e->getMessage());
            $this->response->status(500);
            $this->response->json(['error' => 'Failed to load Gantt data']);
        }
    }
    
    /**
     * Apply column and swimlane filters to tasks
     * 
     * Note: swimlane_id has been repurposed for assignment filtering:
     * - swimlane_id=0: Returns unassigned tasks (owner_id = 0 or null)
     * - swimlane_id=1: Returns tasks assigned to admin (owner_id = 1)
     * - swimlane_id=other: Returns tasks assigned to that user ID
     *
     * @param array $tasks
     * @param int|null $column_id
     * @param int|null $swimlane_id
     * @return array Filtered tasks
     */
    private function applyFilters($tasks, $column_id = null, $swimlane_id = null)
    {
        // Return all tasks if no filters provided
        if (!$column_id && $swimlane_id === null) {
            return $tasks;
        }
        
        $filtered_tasks = [];
        
        foreach ($tasks as $task) {
            $include_task = true;
            
            // Apply column filter
            if ($column_id && $task['column_id'] != $column_id) {
                $include_task = false;
            }
            
            // Apply assignment filter (using swimlane_id parameter)
            if ($swimlane_id !== null) {
                if ($swimlane_id == 0) {
                    // swimlane_id=0: Show only unassigned tasks
                    if (!empty($task['owner_id'])) {
                        $include_task = false;
                    }
                } else {
                    // swimlane_id=1 (admin) or other user IDs: Show tasks assigned to that user
                    if (empty($task['owner_id']) || $task['owner_id'] != $swimlane_id) {
                        $include_task = false;
                    }
                }
            }
            
            if ($include_task) {
                $filtered_tasks[] = $task;
            }
        }
        
        return $filtered_tasks;
    }
    
    /**
     * Get task dependencies/links for the project
     * Only returns links where both source and target are in the filtered task set
     *
     * @param int $project_id
     * @param array $filtered_tasks The filtered task list
     * @return array
     */
    private function getTaskLinks($project_id, $filtered_tasks)
    {
        $links = [];
        
        try {
            // Create array of filtered task IDs for quick lookup
            $filtered_task_ids = array_column($filtered_tasks, 'id');
            
            foreach ($filtered_tasks as $task) {
                // Get links for this task using Kanboard's task link model
                $task_links = $this->taskLinkModel->getAll($task['id']);
                
                foreach ($task_links as $link) {
                    // Focus on dependency relationships (blocks/is blocked by)
                    // Link ID 2 = "blocks", Link ID 3 = "is blocked by"
                    if (in_array($link['link_id'], [2, 3])) {
                        $source_id = $link['task_id'];
                        $target_id = $link['opposite_task_id'];
                        
                        // Only include link if both tasks are in the filtered set
                        if (in_array($source_id, $filtered_task_ids) && in_array($target_id, $filtered_task_ids)) {
                            $links[] = [
                                'id' => $link['id'],
                                'source_task_id' => $source_id,
                                'target_task_id' => $target_id,
                                'link_id' => $link['link_id'],
                                'label' => $link['label']
                            ];
                        }
                    }
                }
            }
        } catch (Exception $e) {
            $this->logger->error('Error getting task links: ' . $e->getMessage());
        }
        
        return $links;
    }
} 