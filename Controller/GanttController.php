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
            // Get all active tasks for the project
            $tasks = $this->taskFinderModel->getAll($project['id'], 1); // 1 = active tasks only
            
            // Get task dependencies/links
            $links = $this->getTaskLinks($project['id']);
            
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
     * Get task dependencies/links for the project
     *
     * @param int $project_id
     * @return array
     */
    private function getTaskLinks($project_id)
    {
        $links = [];
        
        try {
            // Get all tasks in the project to check their links
            $tasks = $this->taskFinderModel->getAll($project_id, 1);
            
            foreach ($tasks as $task) {
                // Get links for this task using Kanboard's task link model
                $task_links = $this->taskLinkModel->getAll($task['id']);
                
                foreach ($task_links as $link) {
                    // Focus on dependency relationships (blocks/is blocked by)
                    // Link ID 2 = "blocks", Link ID 3 = "is blocked by"
                    if (in_array($link['link_id'], [2, 3])) {
                        $links[] = [
                            'id' => $link['id'],
                            'source_task_id' => $link['task_id'],
                            'target_task_id' => $link['opposite_task_id'],
                            'link_id' => $link['link_id'],
                            'label' => $link['label']
                        ];
                    }
                }
            }
        } catch (Exception $e) {
            $this->logger->error('Error getting task links: ' . $e->getMessage());
        }
        
        return $links;
    }
} 