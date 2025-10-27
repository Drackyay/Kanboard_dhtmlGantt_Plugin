<?php

namespace Kanboard\Plugin\DhtmlGantt\Controller;

use Kanboard\Controller\BaseController;
use Kanboard\Filter\TaskProjectFilter;
use Kanboard\Model\TaskModel;

/**
 * Tasks Gantt Controller
 *
 * @package  Kanboard\Plugin\DhtmlGantt\Controller
 * @author   Your Development Team
 * @property \Kanboard\Plugin\DhtmlGantt\Formatter\TaskGanttFormatter $taskGanttFormatter
 */
class TaskGanttController extends BaseController
{
    
    /**
     * Show Gantt chart for one project
     */
    public function show()
    {
        $project = $this->getProject();
        if (isset($_GET['search'])) {
            $search = $this->helper->projectHeader->getSearchQuery($project);
        } else {
            // $search = 'n';
            $search = 'status:open status:closed'; // want to show all tasks or only open ones
        }

        $sorting = $this->request->getStringParam('sorting', '');
        $filter = $this->taskLexer->build($search)->withFilter(new TaskProjectFilter($project['id']));

        if ($sorting === '') {
            $sorting = $this->configModel->get('dhtmlgantt_task_sort', 'board');
        }

        if ($sorting === 'date') {
            $filter->getQuery()->asc(TaskModel::TABLE.'.date_started')->asc(TaskModel::TABLE.'.date_due');
        } else {
            $filter->getQuery()->asc('column_position')->asc(TaskModel::TABLE.'.position');
        }

        $this->response->html($this->helper->layout->app('DhtmlGantt:task_gantt/show', array(
            'project' => $project,
            'title' => $project['name'],
            'description' => $this->helper->projectHeader->getDescription($project),
            'sorting' => $sorting,
            'tasks' => $filter->format($this->taskGanttFormatter),
        )));
    }

    /**
     * Save new task start date and due date
     */
    public function save()
    {
        $this->getProject();
        $changes = $this->request->getJson();
        $values = [];

        if (! empty($changes['start_date'])) {
            $values['date_started'] = strtotime($changes['start_date']);
        }

        if (! empty($changes['end_date'])) {
            $values['date_due'] = strtotime($changes['end_date']);
        }

        if (! empty($values)) {
            $task_id = (int) $changes['id'];
            $values['id'] = $task_id;
            
            $result = $this->taskModificationModel->update($values);

            if (! $result) {
                $this->response->json(array('result' => 'error', 'message' => 'Unable to save task'), 400);
            } else {
                $this->response->json(array('result' => 'ok', 'message' => 'Task updated successfully'), 200);
            }
        } else {
            $this->response->json(array('result' => 'ignored', 'message' => 'No changes'), 200);
        }
    }

    /**
     * Create new task
     */
    public function create()
    {
        $project = $this->getProject();
        $data = $this->request->getJson();

        $task_id = $this->taskCreationModel->create(array(
            'project_id' => $project['id'],
            'title' => $data['text'] ?? 'New Task',
            'date_started' => !empty($data['start_date']) ? strtotime($data['start_date']) : null,
            'date_due' => !empty($data['end_date']) ? strtotime($data['end_date']) : null,
            'creator_id' => $this->userSession->getId(),
        ));

        if ($task_id) {
            $this->response->json(array(
                'result' => 'ok',
                'id' => $task_id,
                'message' => 'Task created successfully'
            ), 201);
        } else {
            $this->response->json(array(
                'result' => 'error',
                'message' => 'Unable to create task'
            ), 400);
        }
    }

    /**
     * Delete task
     */
    public function remove()
    {
        $project = $this->getProject();
        $task_id = (int) $this->request->getStringParam('id');

        if ($task_id && $this->taskModel->remove($task_id)) {
            $this->response->json(array(
                'result' => 'ok',
                'message' => 'Task deleted successfully'
            ), 200);
        } else {
            $this->response->json(array(
                'result' => 'error',
                'message' => 'Unable to delete task'
            ), 400);
        }
    }

        /**
     * Alias for DHTMLX Gantt link creation
     * (Handles frontend POST to ?action=link)
     */
    public function link()
    {
        $project = $this->getProject();
        $data = $this->request->getJson();

        $source = isset($data['source']) ? (int) $data['source'] : 0;
        $target = isset($data['target']) ? (int) $data['target'] : 0;

        if ($source <= 0 || $target <= 0) {
            return $this->response->json(['action' => 'error', 'message' => 'Invalid task IDs'], 400);
        }

        // Create internal link (child-of relationship)
        $result = $this->taskLinkModel->create([
            'task_id'          => $target,
            'opposite_task_id' => $source,
            'link_id'          => 1, // "is a child of"
        ]);

        if ($result) {
            return $this->response->json(['action' => 'inserted', 'tid' => $result]);
        } else {
            return $this->response->json(['action' => 'error', 'message' => 'Unable to create link'], 500);
        }
    }


    /**
     * Save task dependency (link connection)
     */
// In TaskGanttController.php
public function dependency()
{
    $values = $this->request->getJson();

    if (empty($values['source']) || empty($values['target'])) {
        return $this->response->json(['result' => 'error'], 400);
    }

    $ok = $this->taskLinkModel->create([
        'task_id' => $values['source'],
        'opposite_task_id' => $values['target'],
        'link_id' => 1,
    ]);

    return $this->response->json(['result' => $ok ? 'ok' : 'error'], $ok ? 200 : 400);
}
    //add a remove dependency function
    public function removeDependency()
    {
        $values = $this->request->getJson();

        if (empty($values['id'])) {
            return $this->response->json(['result' => 'error'], 400);
        }

        $ok = $this->taskLinkModel->remove($values['id']);

        return $this->response->json(['result' => $ok ? 'ok' : 'error'], $ok ? 200 : 400);
    }


    /**
     * Check if creating a dependency would create a circular reference
     */
    private function wouldCreateCircularDependency($sourceTaskId, $targetTaskId)
    {
        // Get all tasks that depend on the target task
        $dependentTasks = $this->getAllDependentTasks($targetTaskId);
        
        // If the source task is in the dependent tasks list, it would create a cycle
        return in_array($sourceTaskId, $dependentTasks);
    }

    /**
     * Get all tasks that depend on a given task (recursive)
     */
    private function getAllDependentTasks($taskId, $visited = array())
    {
        if (in_array($taskId, $visited)) {
            return array(); // Prevent infinite recursion
        }

        $visited[] = $taskId;
        $dependentTasks = array();

        // Get all tasks that have this task as a dependency
        $links = $this->taskLinkModel->getAll($taskId);
        
        foreach ($links as $link) {
            $dependentTaskId = $link['task_id'];
            $dependentTasks[] = $dependentTaskId;
            
            // Recursively get tasks that depend on this dependent task
            $subDependents = $this->getAllDependentTasks($dependentTaskId, $visited);
            $dependentTasks = array_merge($dependentTasks, $subDependents);
        }

        return array_unique($dependentTasks);
    }
}

