<li <?= $this->app->checkMenuSelection('DhtmlGantt:ProjectGanttController', 'show') ?>>
    <i class="fa fa-sliders fa-fw"></i>
    <?= $this->url->link(t('Gantt'), 'DhtmlGantt:ProjectGanttController', 'show', array('project_id' => $project['id'])) ?>
</li>
