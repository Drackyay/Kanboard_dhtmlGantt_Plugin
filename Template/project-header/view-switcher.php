<li <?= $this->app->checkMenuSelection('TaskGanttController', 'show') ?>>
    <i class="fa fa-sliders fa-fw"></i>
    <?= $this->url->link(t('Gantt'), 'TaskGanttController', 'show', array('project_id' => $project['id'], 'plugin' => 'DhtmlGantt')) ?>
</li>