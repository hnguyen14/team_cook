(function() {
  function gotoStep(step) {
    $('.ministep-active').toggleClass('ministep-active ministep-done');
    $('.step').hide();
    step.ministep.addClass('ministep-active');
    step.bigstep.show();
    startStepTimer(step);
  }

  function nextStep() {
    var step = $('.step:visible').data('step');
    if (step) {
      var nextStep = steps[step.step];
      if (nextStep) {
        gotoStep(nextStep);
      } else {
        $('.step').hide();
        $('#splash').show();
      }
    } else {
      gotoStep(steps[0]);
    }
  }

  function startStepTimer(step) {
    if (step && step.duration) {
      step.started = Date.now();
    }
  }

  function msToTime(duration) {
      var milliseconds = parseInt((duration%1000)/100)
          , seconds = parseInt((duration/1000)%60)
          , minutes = parseInt((duration/(1000*60))%60)
          , hours = parseInt((duration/(1000*60*60))%24);

      hours = (hours < 10) ? "0" + hours : hours;
      minutes = (minutes < 10) ? "0" + minutes : minutes;
      seconds = (seconds < 10) ? "0" + seconds : seconds;

      return hours + ":" + minutes + ":" + seconds;
  }

  function updateTimers() {
    steps.forEach(function(step) {
      if (step.started) {
        var remaining = step.duration - (Date.now() - step.started);
        $('.ministep-timer', step.ministep).text(msToTime(remaining));
      }
    });
  }

  var ministepTmpl = $('#ministep-template').html();
  var stepTmpl = $('#step-template').html();
  var dataDfd = $.getJSON('/hainanese.json');
  var steps;

  dataDfd.done(function(data) {
    steps = data.steps;
    steps.forEach(function(step) {
      var ministep = $(ministepTmpl);
      ministep.find('.ministep-image img')
        .attr('src', step.image);
      ministep.find('.ministep-text')
        .text(step.direction);
      ministep.find('.ministep-timer')
        .text(step.duration && msToTime(step.duration));
      $('.ministeps').append(ministep);

      var bigstep = $(stepTmpl);
      bigstep.find('.step-image')
        .attr('src', step.image);
      bigstep.find('.step-text')
        .text(step.direction);
      $('.steps').append(bigstep);

      step.ministep = ministep;
      step.bigstep = bigstep;
      ministep.data('step', step);
      bigstep.data('step', step);
    });
    setInterval(updateTimers, 1000);
  });

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
