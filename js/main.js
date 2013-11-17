(function() {
  function gotoStep(step) {
    $('.ministep-active').toggleClass('ministep-active ministep-done');
    $('.step').hide();
    step.ministep.addClass('ministep-active');
    step.bigstep.show();
    startStepTimer(step);
    startStepThermometer(step);
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
          step.ministep.trigger('timerExpired');
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
          step.ministep.trigger('onFire');
        }
      }
    });
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
      if (e.keyCode == 40) {
        dataDfd.done(function() {
          if ($('.step:visible').length) {
            nextStep();
          }
        });
      }
    });
    $('.steps').on('click', '.step', function(e) {
      nextStep();
    });
    $('.ministeps').on('timerExpired onFire', '.ministep', function(e) {
      $(this)
        .addClass('ministep-danger')
        .trigger('startRumble');
    });
  });
})();
