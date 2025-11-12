<section id="main" style="display: flex; flex-direction: column; height: 100%;">
    <?= $this->projectHeader->render($project, 'TaskGanttController', 'show', false, 'DhtmlGantt') ?>

    <?php
        // read current sorting and group selection passed from controller
        $sorting = isset($sorting) ? $sorting : $this->request->getStringParam('sorting', 'board');
        $cur     = isset($groupBy) && $groupBy !== '' ? $groupBy : 'none';
    ?>
    
    <div class="menu-inline" style="flex-shrink: 0;">
        <ul>
            <!-- Sort by position -->
            <li <?= $sorting === 'board' ? 'class="active"' : '' ?>>
                <?= $this->url->icon(
                    'sort-numeric-asc',
                    t('Sort by position'),
                    'TaskGanttController',
                    'show',
                    array(
                        'project_id' => $project['id'],
                        'sorting'    => 'board',
                        'plugin'     => 'DhtmlGantt',
                        'group_by'   => $cur
                    )
                ) ?>
            </li>

            <!-- Sort by date -->
            <li <?= $sorting === 'date' ? 'class="active"' : '' ?>>
                <?= $this->url->icon(
                    'sort-amount-asc',
                    t('Sort by date'),
                    'TaskGanttController',
                    'show',
                    array(
                        'project_id' => $project['id'],
                        'sorting'    => 'date',
                        'plugin'     => 'DhtmlGantt',
                        'group_by'   => $cur
                    )
                ) ?>
            </li>

            <li>
                <?= $this->modal->large('plus', t('Add task'), 'TaskCreationController', 'show', array('project_id' => $project['id'])) ?>
            </li>

            <!-- View buttons (handled by external JS) -->
            <li><button type="button" class="btn btn-dhtmlx-view" data-view="Quarter Day">Quarter Day</button></li>
            <li><button type="button" class="btn btn-dhtmlx-view" data-view="Half Day">Half Day</button></li>
            <li><button type="button" class="btn btn-dhtmlx-view" data-view="Day">Day</button></li>
            <li><button type="button" class="btn btn-dhtmlx-view active" data-view="Week">Week</button></li>
            <li><button type="button" class="btn btn-dhtmlx-view" data-view="Month">Month</button></li>
        </ul>
    </div>

    <div class="dhtmlx-gantt-container" style="flex: 1; display: flex; flex-direction: column; min-height: 0; overflow: hidden;">
        <!-- DHtmlX Gantt Toolbar -->
        <div class="dhtmlx-gantt-toolbar" style="flex-shrink: 0;">
            <button id="dhtmlx-add-task" class="btn btn-blue" title="<?= t('Add Task') ?>">
                <i class="fa fa-plus"></i> <?= t('Add Task') ?>
            </button>

            <!-- Group by dropdown -->
            <div style="display: flex; align-items: center; gap: 6px; margin-left: 10px;">
                <i class="fa fa-users" style="color: #666;"></i>
                <span style="font-size: 13px; color: #666;"><?= t('Group by') ?>:</span>
                <select id="dhtmlx-group-by" class="btn" style="height: 32px; padding: 5px 10px; font-size: 13px; min-width: 120px; max-width: 150px;">
                    <option value="none"><?= t('None') ?></option>
                    <option value="assignee"><?= t('Assignee') ?></option>
                    <option value="group"><?= t('User Group') ?></option>
                    <option value="sprint"><?= t('Sprint') ?></option>
                </select>
            </div>

            <!-- Toggle Workload View -->
            <button id="dhtmlx-toggle-resources" class="btn" title="<?= t('Toggle Workload View') ?>">
                <i class="fa fa-bar-chart"></i> <?= t('Workload View') ?>
            </button>

            <!-- Toggle: Move Dependencies -->
            <label class="dhtmlx-toggle" style="margin-left: 15px;">
                <input type="checkbox" id="move-dependencies-toggle">
                <?= t('Move dependencies with task') ?>
            </label>

            <!-- Toggle: Show Progress Bars -->
            <label class="dhtmlx-toggle" style="margin-left: 15px;">
                <input type="checkbox" id="show-progress-toggle" checked>
                <?= t('Show progress bars') ?>
            </label>

            <div class="dhtmlx-toolbar-separator"></div>

            <button id="dhtmlx-zoom-in" class="btn" title="<?= t('Zoom In') ?>">
                <i class="fa fa-search-plus"></i>
            </button>

            <button id="dhtmlx-zoom-out" class="btn" title="<?= t('Zoom Out') ?>">
                <i class="fa fa-search-minus"></i>
            </button>

            <button id="dhtmlx-expand-toggle" class="btn" title="<?= t('Expand All') ?>" data-state="collapsed">
                <i class="fa fa-expand"></i>
            </button>
        </div>

        <!-- Gantt Chart -->
        <div id="dhtmlx-gantt-chart"
             data-project-id="<?= $project['id'] ?>"
             data-group-by="<?= $cur ?>" 
             style="flex: 1; width: 100%; min-height: 0; position: relative;"
             data-tasks='<?= htmlspecialchars(json_encode($tasks), ENT_QUOTES, 'UTF-8') ?>'
             data-update-url="<?= $this->url->href('TaskGanttController', 'save', array('project_id' => $project['id'], 'plugin' => 'DhtmlGantt')) ?>"
             data-create-url="<?= $this->url->href('TaskGanttController', 'create', array('project_id' => $project['id'], 'plugin' => 'DhtmlGantt')) ?>"
             data-remove-url="<?= $this->url->href('TaskGanttController', 'remove', array('project_id' => $project['id'], 'plugin' => 'DhtmlGantt')) ?>"
             data-create-link-url="<?= $this->url->href('TaskGanttController', 'dependency', array('project_id' => $project['id'], 'plugin' => 'DhtmlGantt')) ?>"
             data-remove-link-url="<?= $this->url->href('TaskGanttController', 'removeDependency', array('project_id' => $project['id'], 'plugin' => 'DhtmlGantt')) ?>">
        </div>

        <!-- Task Information Panel -->
        <div class="dhtmlx-gantt-info" style="flex-shrink: 0;">
            <div class="dhtmlx-info-section">
                <h3><?= t('Project Statistics') ?></h3>
                <div class="dhtmlx-stats">
                    <div class="dhtmlx-stat-item">
                        <span class="dhtmlx-stat-label"><?= t('Total Tasks') ?>:</span>
                        <span class="dhtmlx-stat-value"><?= count($tasks['data'] ?? $tasks) ?></span>
                    </div>
                    <div class="dhtmlx-stat-item">
                        <span class="dhtmlx-stat-label"><?= t('Completed') ?>:</span>
                        <span class="dhtmlx-stat-value" id="dhtmlx-completed-count">0</span>
                    </div>
                    <div class="dhtmlx-stat-item">
                        <span class="dhtmlx-stat-label"><?= t('In Progress') ?>:</span>
                        <span class="dhtmlx-stat-value" id="dhtmlx-progress-count">0</span>
                    </div>
                </div>
            </div>

            <div class="dhtmlx-info-section">
                <h3><?= t('Legend') ?></h3>
                <div class="dhtmlx-legend">
                    <div class="dhtmlx-legend-item">
                        <span class="dhtmlx-legend-color" style="background: #27ae60;"></span>
                        <span><?= t('Milestone') ?></span>
                    </div>
                    
                    <?php
                    // Display Groups with Group_assign color generation
                    $groups = $groups ?? [];
                    
                    // Function to generate colors using EXACT Group_assign algorithm
                    function getGroupColorInTemplate($groupName) {
                        // Use EXACT Group_assign CRC32 algorithm
                        $code = dechex(crc32($groupName));
                        $code = substr($code, 0, 6);
                        return '#' . $code;
                    }
                    
                    if (!empty($groups)):
                    ?>
                        <strong style="font-size: 11px; color: #666; display: block; margin-top: 10px; margin-bottom: 5px;">
                            <?= t('User Groups (Fill Colors):') ?>
                        </strong>
                        <?php foreach ($groups as $group): ?>
                            <?php 
                            // Use Group_assign's color generation algorithm directly
                            $groupColor = getGroupColorInTemplate($group['name']);
                            ?>
                            <div class="dhtmlx-legend-item">
                                <span class="dhtmlx-legend-color" 
                                      style="background: <?= $groupColor ?>; border: 2px solid #ddd;">
                                </span>
                                <span><?= $this->text->e($group['name']) ?></span>
                            </div>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <div style="padding: 8px; background: #fff3cd; border-left: 3px solid #ffc107; margin-top: 10px; font-size: 12px;">
                            ℹ️ <?= t('No user groups defined. Tasks without groups use default colors.') ?>
                        </div>
                    <?php endif; ?>
                    
                    <!-- Sprint Colors -->
                    <strong style="font-size: 11px; color: #666; display: block; margin-top: 10px; margin-bottom: 5px;">
                        <?= t('Sprints:') ?>
                    </strong>
                    <div class="dhtmlx-legend-item">
                        <span class="dhtmlx-legend-color" style="background: #3498db; border: 2px solid #ddd;"></span>
                        <span><?= t('Sprint Tasks') ?></span>
                    </div>
                    <div class="dhtmlx-legend-item">
                        <span class="dhtmlx-legend-color" style="background: #95a5a6; border: 2px solid #ddd;"></span>
                        <span><?= t('Regular Tasks') ?></span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Custom Workload Panel (hidden by default) -->
        <div id="workload-panel" class="workload-panel hidden">
            <div class="workload-header">
                <h4><?= t('Tasks per Person - Workload Summary') ?></h4>
            </div>
            <div id="workload-content" class="workload-content">
                <p class="workload-loading"><?= t('Loading workload data...') ?></p>
            </div>
        </div>
    </div>
</section>

<style>
.dhtmlx-gantt-container {
    border: 1px solid #ddd;
    background: #fff;
}
.dhtmlx-gantt-toolbar {
    background: #f8f9fa;
    border-bottom: 1px solid #ddd;
    padding: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
}
.dhtmlx-toolbar-separator {
    width: 1px;
    height: 20px;
    background: #ddd;
    margin: 0 5px;
}
.dhtmlx-gantt-info {
    background: #f8f9fa;
    border-top: 1px solid #ddd;
    padding: 15px;
    display: flex;
    gap: 30px;
}
.dhtmlx-info-section h3 {
    margin: 0 0 10px 0;
    font-size: 14px;
    font-weight: bold;
}
.dhtmlx-stats { display: flex; gap: 20px; }
.dhtmlx-stat-item { display: flex; flex-direction: column; align-items: center; }
.dhtmlx-stat-label { font-size: 12px; color: #666; }
.dhtmlx-stat-value { font-size: 18px; font-weight: bold; color: #333; }
.dhtmlx-legend { display: flex; flex-direction: column; gap: 5px; }
.dhtmlx-legend-item { display: flex; align-items: center; gap: 8px; }
.dhtmlx-legend-color { width: 16px; height: 16px; border-radius: 3px; }
.gantt_task_line.dhtmlx-readonly { opacity: 0.6; }
.btn-dhtmlx-view.active { background-color: #667eea !important; color: white !important; }
.dhtmlx-toggle { display: flex; align-items: center; gap: 5px; font-size: 13px; color: #333; cursor: pointer; }
.dhtmlx-toggle input[type="checkbox"] { transform: scale(1.1); margin-right: 5px; }

/* Workload Panel Styles */
.workload-panel {
    width: 100%;
    background: #fff;
    border-top: 2px solid #ddd;
    max-height: 300px;
    display: block;
    transition: max-height 0.3s ease;
    overflow: hidden;
}

.workload-panel.hidden {
    max-height: 0;
    border-top: none;
}

.workload-header {
    background: #f8f9fa;
    padding: 10px 15px;
    border-bottom: 1px solid #ddd;
}

.workload-header h4 {
    margin: 0;
    font-size: 14px;
    font-weight: bold;
    color: #333;
}

.workload-content {
    padding: 15px;
    max-height: 250px;
    overflow-y: auto;
}

.workload-loading {
    text-align: center;
    color: #999;
    font-style: italic;
}

.workload-table {
    width: 100%;
    border-collapse: collapse;
}

.workload-table th {
    background: #f0f0f0;
    padding: 10px;
    text-align: left;
    font-weight: bold;
    border-bottom: 2px solid #ddd;
    font-size: 13px;
}

.workload-table td {
    padding: 10px;
    border-bottom: 1px solid #eee;
    font-size: 13px;
}

.workload-table tr:hover {
    background: #f9f9f9;
}

.workload-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-weight: bold;
    font-size: 12px;
    min-width: 30px;
    text-align: center;
}

.workload-available {
    background: #d4edda;
    color: #155724;
}

.workload-busy {
    background: #fff3cd;
    color: #856404;
}

.workload-overloaded {
    background: #f8d7da;
    color: #721c24;
}

.workload-task-list {
    font-size: 11px;
    color: #666;
    margin-top: 5px;
}

.workload-task-item {
    display: inline-block;
    background: #e9ecef;
    padding: 2px 8px;
    margin: 2px;
    border-radius: 3px;
}

#dhtmlx-toggle-resources.active {
    background-color: #667eea !important;
    color: white !important;
}
</style>
