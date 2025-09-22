<li>
    <i class="fa fa-sliders fa-fw"></i>
    <?= $this->url->link(t('Gantt chart'), 'DhtmlGantt:ProjectGanttController', 'show', array('project_id' => $project['id'])) ?>
</li>
