<li>
    <i class="fa fa-sliders fa-fw"></i>
    <?= $this->url->link(t('DHtmlX Gantt chart'), 'TaskGanttController', 'show', array('project_id' => $project['id'], 'plugin' => 'DhtmlGantt')) ?>
</li>
