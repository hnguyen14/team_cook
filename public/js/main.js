(function() {
  var ministepTmpl = $('#ministep-template').html();
  var stepTmpl = $('#step-template').html();
  var dataDfd = $.getJSON('/hainanese.json');
  var steps;

  dataDfd.done(function(data) {
    steps = data.steps;
    steps.forEach(function(step) {
      var ministep = $(ministepTmpl);
      ministep
        .find('.ministep-image img')
          .attr('src', step.image);
      ministep
        .find('.ministep-text')
          .text(step.direction);
      $('.ministeps').append(ministep);

      var bigstep = $(stepTmpl);
      bigstep.data('step', step.step);
      bigstep
        .find('.step-image')
          .attr('src', step.image);
      bigstep
        .find('.step-text')
          .text(step.direction);
      $('.steps').append(bigstep);
    });
  });

  function gotoStep(step) {
    $('.ministep-active').toggleClass('ministep-active ministep-done');
    $('.step').hide();
    if (step <= steps.length) {
      $('.ministep:nth-child(' + step + ')').addClass('ministep-active');
      $('.step:nth-child(' + step + ')').show();
    } else {
      $('#splash').show();
    }
  }

  function nextStep() {
    var step = $('.step:visible').data('step');
    if (step) {
      gotoStep(step + 1);
    } else {
      gotoStep(1);
    }
  }

  $(function() {
    $('#splash').one('click', function(e) {
      dataDfd.done(function() {
        $(e.currentTarget).hide();
        nextStep();
      });
    });
    $('.steps').on('click', '.step', function(e) {
      nextStep();
    });
  });
})();
