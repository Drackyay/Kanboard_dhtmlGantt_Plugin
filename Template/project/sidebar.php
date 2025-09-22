<li <?= $this->app->checkMenuSelection('DhtmlGantt:ProjectGanttController') ?>>
    <?= $this->url->link(t('Gantt chart'), 'DhtmlGantt:ProjectGanttController', 'show', array('project_id' => $project['id'])) ?>
</li>
