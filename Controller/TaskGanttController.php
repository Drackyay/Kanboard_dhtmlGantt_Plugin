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
            $search = $this->enhanceSearchQuery($search);
        } else {
            $search = 'status:open status:closed';
        }

        $sorting = $this->request->getStringParam('sorting', '');

        // NEW: read dropdown selection (none|group|assignee|sprint)
        $groupBy = $this->request->getStringParam('group_by', 'none');

        // tell the formatter what to do
        if (method_exists($this->taskGanttFormatter, 'setGroupBy')) {
            $this->taskGanttFormatter->setGroupBy($groupBy);
        }        

        $filter = $this->taskLexer->build($search)->withFilter(new TaskProjectFilter($project['id']));

        if ($sorting === '') {
            $sorting = $this->configModel->get('dhtmlgantt_task_sort', 'board');
        }

        if ($sorting === 'date') {
            $filter->getQuery()->asc(TaskModel::TABLE.'.date_started')->asc(TaskModel::TABLE.'.date_due');
        } else {
            $filter->getQuery()->asc('column_position')->asc(TaskModel::TABLE.'.position');
        }

        // NEW: move-dependencies preference (unchanged)
        $moveDepsEnabled = $this->projectMetadataModel->get($project['id'], 'move_dependencies_enabled', true);

        // (Optional) if your formatter needs the project context:
        if (method_exists($this->taskGanttFormatter, 'setProject')) {
            $this->taskGanttFormatter->setProject($project);
        }

        $this->response->html($this->helper->layout->app(
            'DhtmlGantt:task_gantt/show',
            array(
                'project'          => $project,
                'title'            => $project['name'],
                'description'      => $this->helper->projectHeader->getDescription($project),
                'sorting'          => $sorting,
                'tasks'            => $filter->format($this->taskGanttFormatter),
                'moveDepsEnabled'  => $moveDepsEnabled,
                'groupBy'          => $groupBy, // NEW (optional—your template can also read from request)
            )
        ));
    }


    /**
     * Save task updates (title, dates, priority, etc.)
     */
    public function save()
    {
        $this->getProject();
        $changes = $this->request->getJson();
        $values = [];
        
        // Debug logging
        error_log('DHtmlX Gantt Save - Received data: ' . json_encode($changes));

        $task_id = (int) $changes['id'];
        $values['id'] = $task_id;

        // Update title/description
        if (! empty($changes['text'])) {
            $values['title'] = $changes['text'];
        }

        // Update start date
        if (! empty($changes['start_date'])) {
            $startTime = strtotime($changes['start_date']);
            if ($startTime !== false) {
                $values['date_started'] = $startTime;
            }
        }

        // Update end/due date
        if (! empty($changes['end_date'])) {
            $endTime = strtotime($changes['end_date']);
            if ($endTime !== false) {
                $values['date_due'] = $endTime;
            }
        }

        // Update priority
        if (isset($changes['priority'])) {
            $priorityMap = array(
                'low' => 1,
                'normal' => 0,
                'medium' => 2,
                'high' => 3
            );
            if (isset($priorityMap[$changes['priority']])) {
                $values['priority'] = $priorityMap[$changes['priority']];
            }
        }
        
        // Update assignee (owner_id)
        if (isset($changes['owner_id'])) {
            $values['owner_id'] = (int) $changes['owner_id'];
            error_log('DHtmlX Gantt Save - Setting owner_id to: ' . $values['owner_id']);
        }
        
        // Handle milestone status
        if (isset($changes['is_milestone'])) {
            $isMilestone = $changes['is_milestone'] ? '1' : '0';
            error_log('DHtmlX Gantt Save - Setting milestone status to: ' . $isMilestone);
            $this->taskMetadataModel->save($task_id, array('is_milestone' => $isMilestone));
        }

        // Always try to update if we have values (at minimum we have the ID)
        if (count($values) > 1) {
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
            $this->response->json(array('result' => 'ok', 'message' => 'No changes'), 200);
        }
    }

    /**
     * Create new task
     */
    public function create()
    {
        $project = $this->getProject();
        $data = $this->request->getJson();
        
        // Debug logging
        error_log('DHtmlX Gantt Create - Received data: ' . json_encode($data));

        // Map priority from string to integer
        $priority = 0; // default to normal
        if (isset($data['priority'])) {
            $priorityMap = array(
                'low' => 1,
                'normal' => 0,
                'medium' => 2,
                'high' => 3
            );
            if (isset($priorityMap[$data['priority']])) {
                $priority = $priorityMap[$data['priority']];
            }
        }

        $task_id = $this->taskCreationModel->create(array(
            'project_id' => $project['id'],
            'title' => $data['text'] ?? 'New Task',
            'date_started' => !empty($data['start_date']) ? strtotime($data['start_date']) : null,
            'date_due' => !empty($data['end_date']) ? strtotime($data['end_date']) : null,
            'priority' => $priority,
            'owner_id' => isset($data['owner_id']) ? (int) $data['owner_id'] : 0,
            'creator_id' => $this->userSession->getId(),
        ));

        if ($task_id) {
            // Save task_type in metadata
            if (isset($data['task_type'])) {
                $taskType = $data['task_type'];
                error_log('DHtmlX Gantt Create - Setting task_type to: ' . $taskType . ' for task: ' . $task_id);
                $this->taskMetadataModel->save($task_id, array('task_type' => $taskType));
                
                // If Sprint, create parent-child links
                if ($taskType === 'sprint' && isset($data['child_tasks']) && is_array($data['child_tasks'])) {
                    $parentLinkId = $this->getLinkIdByLabel('is a parent of');
                    
                    if ($parentLinkId) {
                        foreach ($data['child_tasks'] as $childTaskId) {
                            $childId = (int) $childTaskId;
                            if ($childId > 0) {
                                // Create link: sprint (parent) -> child task
                                $this->taskLinkModel->create($task_id, $childId, $parentLinkId);
                                error_log('DHtmlX Gantt Create - Created parent link from Sprint ' . $task_id . ' to task ' . $childId);
                            }
                        }
                    }
                }
            }
            
            // Save milestone status if provided (for backward compatibility)
            if (isset($data['is_milestone'])) {
                $isMilestone = $data['is_milestone'] ? '1' : '0';
                error_log('DHtmlX Gantt Create - Setting milestone status to: ' . $isMilestone . ' for task: ' . $task_id);
                $this->taskMetadataModel->save($task_id, array('is_milestone' => $isMilestone));
            }
            
            error_log('DHtmlX Gantt Create - Task created successfully with ID: ' . $task_id);
            $this->response->json(array(
                'result' => 'ok',
                'id' => $task_id,
                'message' => 'Task created successfully'
            ), 201);
        } else {
            error_log('DHtmlX Gantt Create - Failed to create task');
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
        $data = $this->request->getJson();
        $task_id = (int) ($data['id'] ?? 0);
        
        // Debug logging
        error_log('DHtmlX Gantt Remove - Received data: ' . json_encode($data));
        error_log('DHtmlX Gantt Remove - Task ID: ' . $task_id);

        if ($task_id && $this->taskModel->remove($task_id)) {
            error_log('DHtmlX Gantt Remove - Task deleted successfully: ' . $task_id);
            $this->response->json(array(
                'result' => 'ok',
                'message' => 'Task deleted successfully'
            ), 200);
        } else {
            error_log('DHtmlX Gantt Remove - Failed to delete task: ' . $task_id);
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
    
    // POST /dhtmlxgantt/:project_id/dependency
    public function addDependency()
    {
        $project = $this->getProject();
        $payload = json_decode($this->request->getBody(), true) ?: [];

        $source = (int) ($payload['source'] ?? 0);
        $target = (int) ($payload['target'] ?? 0);

        // 1) Basic checks
        if (!$source || !$target || $source === $target) {
            return $this->response->json(['result' => 'error','message' => 'Invalid source/target'], 400);
        }

        // 2) SAME-LEVEL RULE
        $s = $this->taskModel->getById($source);
        $t = $this->taskModel->getById($target);
        $sParent = (int) ($s['owner_id'] ? 0 : 0); // placeholder; we use internal links to compute parent (see note below)

        // If you already expose parent in your formatter, just read it back from DB:
        $sParent = (int) ($s['parent_id'] ?? 0);
        $tParent = (int) ($t['parent_id'] ?? 0);

        $sameLevel = (($sParent === 0 && $tParent === 0) || ($sParent !== 0 && $sParent === $tParent));
        if (!$sameLevel) {
            return $this->response->json(['result' => 'error','message' => 'Rule: only siblings or top-level tasks can be linked'], 400);
        }

        // 3) CIRCULAR check (cheap)
        if ($this->taskLinkModel->hasLink($target, $source)) {
            return $this->response->json(['result' => 'error','message' => 'Circular dependency detected'], 400);
        }

        // 4) Create internal link: “blocks” from source → target
        $ok = $this->taskLinkModel->create($source, $target, $this->linkModel->getIdByLabel('blocks'));
        if (!$ok) {
            return $this->response->json(['result' => 'error','message' => 'Could not create dependency'], 500);
        }

        return $this->response->json(['result' => 'ok']);
    }

    /**
     * Save or update "Move Dependencies with Task" setting (per project)
     */
    public function saveMoveDependenciesSetting()
    {
        $project = $this->getProject();
        $enabled = $this->request->getStringParam('enabled') === 'true';

        // Save per-project setting in metadata
        $this->projectMetadataModel->save($project['id'], [
            'move_dependencies_enabled' => $enabled ? '1' : '0',
        ]);

        $this->response->json([
            'result' => 'ok',
            'project_id' => $project['id'],
            'enabled' => $enabled,
        ]);
    }

    /**
     * ✅ SMART SEARCH ENHANCEMENT V2
     * Automatically detects username OR user group searches
     * Adds appropriate prefix: "assignee:" for users, "group:" for user groups
     * Makes search more intuitive for stakeholders unfamiliar with Kanboard syntax
     * 
     * @param string $search Original search query
     * @return string Enhanced search query
     */
    private function enhanceSearchQuery($search)
    {
        // Trim whitespace
        $search = trim($search);
        
        // If empty, return as-is
        if (empty($search)) {
            return $search;
        }
        
        // List of Kanboard search keywords/filters
        $kanboardKeywords = [
            'assignee:', 'creator:', 'category:', 'color:', 'column:', 
            'description:', 'due:', 'modified:', 'created:', 'status:', 
            'title:', 'reference:', 'link:', 'swimlane:', 'tag:', 
            'priority:', 'project:', 'subtask:', 'group:'
        ];
        
        // Check if search already contains a Kanboard keyword
        foreach ($kanboardKeywords as $keyword) {
            if (stripos($search, $keyword) !== false) {
                // Already has a filter keyword, return as-is
                return $search;
            }
        }
        
        // Check if it's a simple word/phrase (likely a username or group name)
        // If it contains only alphanumeric, spaces, dots, underscores, hyphens
        if (preg_match('/^[\w\s\.\-]+$/i', $search)) {
            $project = $this->getProject();
            $searchLower = strtolower($search);
            
            // PRIORITY 1: Check user groups first (organizational unit)
            $groups = $this->groupModel->getAll();
            foreach ($groups as $group) {
                $groupName = strtolower($group['name']);
                
                // If search matches group name (exact or partial)
                if ($groupName === $searchLower || 
                    strpos($groupName, $searchLower) !== false) {
                    
                    // Get all users in this group
                    $groupMembers = $this->groupMemberModel->getMembers($group['id']);
                    
                    if (!empty($groupMembers)) {
                        // Build OR query: assignee:user1 assignee:user2 assignee:user3
                        $userQueries = [];
                        foreach ($groupMembers as $member) {
                            $userQueries[] = 'assignee:' . $member['username'];
                        }
                        
                        // Join with OR logic (space-separated in Kanboard means OR for same field)
                        return implode(' ', $userQueries);
                    } else {
                        // Group exists but has no members, return impossible query
                        return 'assignee:__NOBODY__';
                    }
                }
            }
            
            // PRIORITY 2: Check users/assignees in this project
            $users = $this->projectUserRoleModel->getUsers($project['id']);
            foreach ($users as $user) {
                $username = strtolower($user['username']);
                $name = strtolower($user['name'] ?? '');
                
                // If search matches username or name (exact or partial)
                if ($username === $searchLower || $name === $searchLower || 
                    strpos($username, $searchLower) !== false || 
                    strpos($name, $searchLower) !== false) {
                    return 'assignee:' . $search;
                }
            }
            
            // PRIORITY 3: If not found in either, default to assignee search
            // (More common use case than group)
            return 'assignee:' . $search;
        }
        
        // For complex queries with special characters, return as-is
        return $search;
    }

    /**
     * Get project users and groups for assignment dropdowns
     */
    public function getProjectMembers()
    {
        try {
            $project = $this->getProject();
            error_log('DHtmlX Gantt - Getting members for project: ' . $project['id']);
            
            // Get users assigned to this project
            $projectUsers = $this->projectUserRoleModel->getUsers($project['id']);
            error_log('DHtmlX Gantt - Found ' . count($projectUsers) . ' users assigned to project');
            
            $formattedUsers = array();
            
            // Add "Unassigned" option
            $formattedUsers[] = array(
                'key' => 0,
                'label' => 'Unassigned'
            );
            
            // Format users
            foreach ($projectUsers as $user) {
                $userId = isset($user['id']) ? $user['id'] : 0;
                $userName = isset($user['username']) ? $user['username'] : 
                           (isset($user['name']) && $user['name'] ? $user['name'] : 'User #' . $userId);
                
                if ($userId > 0) {
                    $formattedUsers[] = array(
                        'key' => (int)$userId,
                        'label' => $userName
                    );
                }
            }
            
            // Get project groups
            $formattedGroups = array();
            
            // Build array of all user IDs for "All Users" group
            $allUserIds = array();
            foreach ($projectUsers as $user) {
                if (isset($user['id']) && $user['id'] > 0) {
                    $allUserIds[] = (int)$user['id'];
                }
            }
            
            // Add "All Users" option
            $formattedGroups[] = array(
                'key' => 0,
                'label' => 'All Users',
                'members' => $allUserIds
            );
            
            // Get groups assigned to this project
            if (method_exists($this->projectGroupRoleModel, 'getGroups')) {
                $groups = $this->projectGroupRoleModel->getGroups($project['id']);
                error_log('DHtmlX Gantt - Found ' . count($groups) . ' groups for project');
                error_log('DHtmlX Gantt - Groups data: ' . json_encode($groups));
                
                foreach ($groups as $group) {
                    error_log('DHtmlX Gantt - Processing group: ' . json_encode($group));
                    // API returns 'id' and 'name', not 'group_id' and 'group_name'
                    $groupId = isset($group['id']) ? $group['id'] : (isset($group['group_id']) ? $group['group_id'] : 0);
                    $groupName = isset($group['name']) ? $group['name'] : (isset($group['group_name']) ? $group['group_name'] : 'Group #' . $groupId);
                    
                    if ($groupId > 0) {
                        // Get group members
                        $groupMembers = $this->groupMemberModel->getMembers($groupId);
                        error_log('DHtmlX Gantt - Group ' . $groupId . ' has ' . count($groupMembers) . ' members');
                        $memberIds = array();
                        foreach ($groupMembers as $member) {
                            if (isset($member['id'])) {
                                $memberIds[] = (int)$member['id'];
                            }
                        }
                        
                        $formattedGroups[] = array(
                            'key' => (int)$groupId,
                            'label' => $groupName,
                            'members' => $memberIds
                        );
                        error_log('DHtmlX Gantt - Added group: ' . $groupName . ' with members: ' . json_encode($memberIds));
                    }
                }
            } else {
                error_log('DHtmlX Gantt - projectGroupRoleModel->getGroups method does not exist');
            }
            
            error_log('DHtmlX Gantt - Returning data: ' . count($formattedUsers) . ' users, ' . count($formattedGroups) . ' groups');
            
            $this->response->json(array(
                'result' => 'ok',
                'users' => $formattedUsers,
                'groups' => $formattedGroups
            ));
        } catch (\Exception $e) {
            error_log('DHtmlX Gantt - Error in getProjectMembers: ' . $e->getMessage());
            error_log('DHtmlX Gantt - Stack trace: ' . $e->getTraceAsString());
            $this->response->json(array(
                'result' => 'error',
                'message' => $e->getMessage()
            ), 500);
        }
    }

}
