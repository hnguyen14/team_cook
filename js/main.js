(function() {
  function gotoStep(step) {
    $('.ministep-active').removeClass('ministep-active');
    $('.step').hide();
    step.ministep.addClass('ministep-active');
    step.bigstep.show();
  }

  function findNextStep() {
    var currentStep = $('.step:visible').data('step');
    var stepIdx = 0;
    if (currentStep) {
      stepIdx = currentStep.step % steps.length;
    }
    var nextStep = steps[stepIdx];
    while (nextStep.state == 'done') {
      nextStep = steps[++stepIdx % steps.length]
    }
    return nextStep == currentStep ? null : nextStep;
  }

  function nextStep() {
    var step = findNextStep();
    if (step) {
      gotoStep(step);
    } else {
      $('.step').hide();
      $('#splash').show();
    }
  }

  function startStepTimer(step) {
    if (step && step.duration) {
      step.started = Date.now();
      step.ministep.jrumble();
    }
  }

  function startStepThermometer(step) {
    if (step && step.targetTemperature) {
      step.temperature = 72;
      step.ministep.jrumble();
    }
  }

  function updateTimers() {
    steps.forEach(function(step) {
      if (step.started) {
        var remaining = step.duration - (Date.now() - step.started);
        if (remaining <= 0) {
          remaining = 0;
          delete step.started;
          step.ministep.trigger('dangerStep');
        }
        $('.ministep-timer', step.ministep).text(msToTime(remaining));
      }
    });
  }

  function updateTemps() {
    steps.forEach(function(step) {
      if (step.temperature) {
        step.temperature += Math.round(Math.random() * 5);
        $('.ministep-thermometer-temperature', step.ministep).text(step.temperature);
        if (step.temperature >= step.targetTemperature) {
          step.ministep.trigger('dangerStep');
        }
      }
    });
  }

  function advanceStep() {
    var currentStep = $('.step:visible').data('step');
    switch (currentStep.state) {
      case 'started':
        currentStep.ministep.trigger('finishStep');
        break;
      case 'done':
        break;
      case 'danger':
        currentStep.ministep.trigger('finishStep');
        break;
      default:
        if (currentStep.duration || currentStep.targetTemperature) {
          currentStep.ministep.trigger('startStep');
        } else {
          currentStep.ministep.trigger('finishStep');
        }
        break;
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

  var ministepTmpl = $('#ministep-template').html();
  var stepTmpl = $('#step-template').html();
  var dataDfd = $.getJSON('hainanese.json');
  var steps;

  dataDfd.done(function(data) {
    steps = data.steps;
    steps.forEach(function(step) {
      var ministep = $(ministepTmpl);
      $('.ministep-image img', ministep)
        .attr('src', step.image);
      $('.ministep-text', ministep)
        .text(step.direction);
      if (step.duration) {
        $('.ministep-timer', ministep)
          .text(msToTime(step.duration));
        $('.ministep-timer-icon', ministep)
          .show();
      }
      if (step.targetTemperature) {
        $('.ministep-thermometer-temperature', ministep)
          .text('--');
        $('.ministep-thermometer-target', ministep)
          .text(step.targetTemperature);
        $('.ministep-thermometer', ministep).show();
      }
      $('.ministeps').append(ministep);

      var bigstep = $(stepTmpl);
      $('.step-image', bigstep)
        .attr('src', step.image);
      $('.step-text', bigstep)
        .text(step.direction);
      $('.steps').append(bigstep);
      if (step.duration || step.targetTemperature) {
        $('.step-start', bigstep).show();
      } else {
        $('.step-done', bigstep).show();
      }

      step.ministep = ministep;
      step.bigstep = bigstep;
      ministep.data('step', step);
      bigstep.data('step', step);
    });
    setInterval(updateTimers, 1000);
    setInterval(updateTemps, 1000);
  });

  $(function() {
    $('#splash').one('click', function(e) {
      dataDfd.done(function() {
        $(e.currentTarget).hide();
        nextStep();
      });
    });
    $(document).on('keydown', function(e) {
      if (e.keyCode == 38) {
        dataDfd.done(nextStep);
      } else if (e.keyCode == 40) {
        dataDfd.done(advanceStep);
      }
    });
    $('.steps').on('click', '.step', function() {
      dataDfd.done(advanceStep);
    });
    $('.ministep-next').on('click', function() {
        dataDfd.done(nextStep);
      })
    $('.ministeps')
      .on('startStep', '.ministep', function(e) {
        var currentStep = $(this).data('step')
        currentStep.state = 'started';
        startStepTimer(currentStep);
        startStepThermometer(currentStep);
        $('.step-btn', currentStep.bigstep).hide();
        $('.step-done', currentStep.bigstep).show();
      })
      .on('dangerStep', '.ministep', function(e) {
        $(this).data('step').state = 'danger';
        $(this)
          .addClass('ministep-danger')
          .trigger('startRumble');
      })
      .on('finishStep', '.ministep', function(e) {
        var currentStep = $(this).data('step');
        currentStep.state = 'done';
        delete currentStep.started;
        delete currentStep.temperature;
        $(this)
          .removeClass('ministep-danger')
          .trigger('stopRumble')
          .css('opacity', 0.5)
          .addClass('ministep-done');
        $('.step-btn', currentStep.bigstep).hide();
        $('.step-next', currentStep.bigstep).show();
        nextStep();
      })
  });
})();
