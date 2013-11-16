(function() {
  var ministepTmpl = $('#ministep-template').html();
  var stepTmpl = $('#step-template').html();
  var dataDfd = $.getJSON('/hainanese.json');
  dataDfd.done(function(data) {
    data.steps.forEach(function(step) {
      var ministep = $(ministepTmpl);
      ministep
        .find('.ministep-image img')
          .attr('src', step.image);
      ministep
        .find('.ministep-text')
          .text(step.direction);
      $('.ministeps').append(ministep);

      var step = $(stepTmpl);
      step
        .find('.step-image img')
          .attr('src', step.image);
      step
        .find('.step-text')
          .text(step.direction);
    });
  });

  $(function() {
  });
})();
