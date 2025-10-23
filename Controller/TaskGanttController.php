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
        } 

        // elseif ($sorting === 'assignee') {
        //     // NEW: Sort by assignee name, with unassigned tasks at the end
        //     $filter->getQuery()
        //         ->join('users', 'id', 'owner_id', TaskModel::TABLE, 'LEFT')
        //         ->asc('COALESCE(users.name, users.username, "ZZZ_Unassigned")')
        //         ->asc(TaskModel::TABLE.'.position');
        // }
        
        else {
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
        
        // Debug logging
        error_log('DHtmlX Gantt Save - Received data: ' . json_encode($changes));

        if (! empty($changes['start_date'])) {
            $startTime = strtotime($changes['start_date']);
            if ($startTime !== false) {
                $values['date_started'] = $startTime;
            }
        }

        if (! empty($changes['end_date'])) {
            $endTime = strtotime($changes['end_date']);
            if ($endTime !== false) {
                $values['date_due'] = $endTime;
            }
        }

        if (! empty($values)) {
            $task_id = (int) $changes['id'];
            $values['id'] = $task_id;
            
            error_log('DHtmlX Gantt Save - Updating task ' . $task_id . ' with values: ' . json_encode($values));
            
            $result = $this->taskModificationModel->update($values);

            if (! $result) {
                error_log('DHtmlX Gantt Save - Failed to update task ' . $task_id);
                $this->response->json(array('result' => 'error', 'message' => 'Unable to save task'), 400);
            } else {
                error_log('DHtmlX Gantt Save - Successfully updated task ' . $task_id);
                $this->response->json(array('result' => 'ok', 'message' => 'Task updated successfully'), 200);
            }
        } else {
            error_log('DHtmlX Gantt Save - No changes to save');
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
     * Save task dependency (link connection)
     */
    public function dependency()
    {
        $this->getProject();
        $data = $this->request->getJson();
        
        if (empty($data['source']) || empty($data['target'])) {
            $this->response->json(array('result' => 'error', 'message' => 'Missing task IDs'), 400);
            return;
        }

        $sourceTaskId = (int) $data['source'];
        $targetTaskId = (int) $data['target'];

        // Validate that both tasks exist and belong to the current project
        $project = $this->getProject();
        $sourceTask = $this->taskFinderModel->getById($sourceTaskId);
        $targetTask = $this->taskFinderModel->getById($targetTaskId);

        if (!$sourceTask || !$targetTask) {
            $this->response->json(array('result' => 'error', 'message' => 'One or both tasks not found'), 404);
            return;
        }

        if ($sourceTask['project_id'] != $project['id'] || $targetTask['project_id'] != $project['id']) {
            $this->response->json(array('result' => 'error', 'message' => 'Tasks must belong to the same project'), 403);
            return;
        }

        // Check for circular dependencies
        if ($this->wouldCreateCircularDependency($sourceTaskId, $targetTaskId)) {
            $this->response->json(array('result' => 'error', 'message' => 'Circular dependency detected'), 400);
            return;
        }

        // Create new dependency
        $result = $this->taskLinkModel->create(array(
            'task_id' => $targetTaskId,
            'opposite_task_id' => $sourceTaskId,
            'link_id' => 1, // Default link type (relates to)
        ));

        if ($result) {
            $this->response->json(array('result' => 'ok', 'message' => 'Dependency created successfully'), 201);
        } else {
            $this->response->json(array('result' => 'error', 'message' => 'Unable to create dependency'), 500);
        }
    }

    /**
     * Remove task dependency
     */
    public function removeDependency()
    {
        $this->getProject();
        $data = $this->request->getJson();
        
        if (empty($data['id'])) {
            $this->response->json(array('result' => 'error', 'message' => 'Missing link ID'), 400);
            return;
        }

        $linkId = (int) $data['id'];
        
        if ($this->taskLinkModel->remove($linkId)) {
            $this->response->json(array('result' => 'ok', 'message' => 'Dependency removed successfully'), 200);
        } else {
            $this->response->json(array('result' => 'error', 'message' => 'Unable to remove dependency'), 500);
        }
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
