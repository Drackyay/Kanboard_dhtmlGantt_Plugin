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
        // Debug logging
        error_log('DHtmlX Gantt - Dependency method called');
        error_log('Request method: ' . $_SERVER['REQUEST_METHOD']);
        error_log('Content type: ' . ($_SERVER['CONTENT_TYPE'] ?? 'not set'));
        
        try {
            $project = $this->getProject();
            error_log('Project ID: ' . $project['id']);
            
            $data = $this->request->getJson();
            error_log('Received data: ' . json_encode($data));
            
            if (empty($data['source']) || empty($data['target'])) {
                error_log('Missing source or target task IDs');
                $this->response->json(array('result' => 'error', 'message' => 'Missing task IDs'), 400);
                return;
            }
        } catch (Exception $e) {
            error_log('Error in dependency method: ' . $e->getMessage());
            $this->response->json(array('result' => 'error', 'message' => 'Server error: ' . $e->getMessage()), 500);
            return;
        }

        try {
            $sourceTaskId = (int) $data['source'];
            $targetTaskId = (int) $data['target'];
            error_log('Processing dependency: ' . $sourceTaskId . ' -> ' . $targetTaskId);

            // Validate that both tasks exist and belong to the current project
            $sourceTask = $this->taskFinderModel->getById($sourceTaskId);
            $targetTask = $this->taskFinderModel->getById($targetTaskId);

            if (!$sourceTask || !$targetTask) {
                error_log('Task validation failed - source: ' . ($sourceTask ? 'found' : 'not found') . ', target: ' . ($targetTask ? 'found' : 'not found'));
                $this->response->json(array('result' => 'error', 'message' => 'One or both tasks not found'), 404);
                return;
            }

            if ($sourceTask['project_id'] != $project['id'] || $targetTask['project_id'] != $project['id']) {
                error_log('Project validation failed - source project: ' . $sourceTask['project_id'] . ', target project: ' . $targetTask['project_id'] . ', expected: ' . $project['id']);
                $this->response->json(array('result' => 'error', 'message' => 'Tasks must belong to the same project'), 403);
                return;
            }

            // Check for circular dependencies
            if ($this->wouldCreateCircularDependency($sourceTaskId, $targetTaskId)) {
                error_log('Circular dependency detected');
                $this->response->json(array('result' => 'error', 'message' => 'Circular dependency detected'), 400);
                return;
            }

            // Get the "blocks" link type ID
            $blocksLinkId = $this->getLinkIdByLabel('blocks');
            error_log('Blocks link ID: ' . ($blocksLinkId ? $blocksLinkId : 'not found'));
            
            if (!$blocksLinkId) {
                $this->response->json(array('result' => 'error', 'message' => 'Blocks relationship type not found'), 500);
                return;
            }

            // Create "blocks" dependency: source blocks target
            // TaskLinkModel::create() expects 3 separate arguments: (taskId, oppositeTaskId, linkId)
            $result = $this->taskLinkModel->create($sourceTaskId, $targetTaskId, $blocksLinkId);
            error_log('Dependency creation result: ' . ($result ? 'success' : 'failed'));

            if ($result) {
                $this->response->json(array('result' => 'ok', 'message' => 'Dependency created successfully'), 201);
            } else {
                $this->response->json(array('result' => 'error', 'message' => 'Unable to create dependency'), 500);
            }
        } catch (Exception $e) {
            error_log('Exception in dependency creation: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            $this->response->json(array('result' => 'error', 'message' => 'Server error: ' . $e->getMessage()), 500);
        }
    }

    /**
     * Remove task dependency
     */
    public function removeDependency()
    {
        // Debug logging
        error_log('DHtmlX Gantt - removeDependency method called');
        
        try {
            $project = $this->getProject();
            $data = $this->request->getJson();
            error_log('Remove dependency data: ' . json_encode($data));
            
            if (empty($data['id'])) {
                error_log('Missing link ID for removal');
                $this->response->json(array('result' => 'error', 'message' => 'Missing link ID'), 400);
                return;
            }

            $linkId = (int) $data['id'];
            error_log('Attempting to remove link ID: ' . $linkId);
            
            $result = $this->taskLinkModel->remove($linkId);
            error_log('Removal result: ' . ($result ? 'success' : 'failed'));
            
            if ($result) {
                $this->response->json(array('result' => 'ok', 'message' => 'Dependency removed successfully'), 200);
            } else {
                $this->response->json(array('result' => 'error', 'message' => 'Unable to remove dependency'), 500);
            }
        } catch (Exception $e) {
            error_log('Exception in removeDependency: ' . $e->getMessage());
            $this->response->json(array('result' => 'error', 'message' => 'Server error: ' . $e->getMessage()), 500);
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

    /**
     * Get link ID by label (e.g., 'blocks', 'is blocked by')
     */
    private function getLinkIdByLabel($label)
    {
        $link = $this->db->table('links')->eq('label', $label)->findOne();
        return $link ? $link['id'] : null;
    }
}
