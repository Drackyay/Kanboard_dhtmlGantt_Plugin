<?php

namespace Kanboard\Plugin\DhtmlGantt\Controller;

use Kanboard\Controller\BaseController;

/**
 * Project Gantt Controller
 *
 * @package Kanboard\Plugin\DhtmlGantt\Controller
 * @author  Your Name
 */
class ProjectGanttController extends BaseController
{
    /**
     * Show Gantt chart for a project
     */
    public function show()
    {
        $project = $this->getProject();
        
        $this->response->html($this->helper->layout->project('DhtmlGantt:project_gantt/show', array(
            'project' => $project,
            'title' => t('Gantt chart for "%s"', $project['name']),
        ), 'DhtmlGantt:project_gantt/sidebar'));
    }

    /**
     * Get tasks data for Gantt chart (AJAX endpoint)
     */
    public function tasks()
    {
        $project = $this->getProject();
        
        // Get all tasks for the project
        $tasks = $this->taskFinderModel->getAll($project['id']);
        
        // Format tasks for DHtmlX Gantt
        $formatter = new \Kanboard\Plugin\DhtmlGantt\Formatter\ProjectGanttFormatter($this->container);
        $gantt_data = $formatter->formatTasks($tasks);
        
        $this->response->json($gantt_data);
    }

    /**
     * Update task data from Gantt chart (AJAX endpoint)
     */
    public function update()
    {
        $project = $this->getProject();
        $task_id = $this->request->getIntegerParam('id');
        
        if ($task_id && $this->taskModificationModel->update(array(
            'id' => $task_id,
            'date_started' => $this->request->getStringParam('start_date'),
            'date_due' => $this->request->getStringParam('end_date'),
        ))) {
            $this->response->json(array('result' => 'ok'));
        } else {
            $this->response->json(array('result' => 'error'));
        }
    }

    /**
     * Create new task from Gantt chart (AJAX endpoint)
     */
    public function create()
    {
        $project = $this->getProject();
        
        $task_id = $this->taskCreationModel->create(array(
            'project_id' => $project['id'],
            'title' => $this->request->getStringParam('text', 'New Task'),
            'date_started' => $this->request->getStringParam('start_date'),
            'date_due' => $this->request->getStringParam('end_date'),
            'creator_id' => $this->userSession->getId(),
        ));

        if ($task_id) {
            $this->response->json(array(
                'result' => 'ok',
                'id' => $task_id,
            ));
        } else {
            $this->response->json(array('result' => 'error'));
        }
    }

    /**
     * Delete task from Gantt chart (AJAX endpoint)
     */
    public function remove()
    {
        $project = $this->getProject();
        $task_id = $this->request->getIntegerParam('id');
        
        if ($task_id && $this->taskModel->remove($task_id)) {
            $this->response->json(array('result' => 'ok'));
        } else {
            $this->response->json(array('result' => 'error'));
        }
    }
}
