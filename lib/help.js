/*
 * contrib
 * https://github.com/contrib/contrib
 *
 * Copyright (c) 2014 Steve Heffernan
 * Licensed under the Apache license.
 */

'use strict';

/**
 * Export the main function
 */
exports = module.exports = help;

var log = require('./log');
var handlebars = require('handlebars');
var _ = require('lodash');
var fs = require('fs');

var OPTIONS = require('./options');

/**
 * Templates
 */
var helpTemplate = fs.readFileSync(__dirname+'/../templates/help.hbs', 'utf8');


function help(config){
  var commandName;

  // check if this is a command
  if (config.config && config.full) {
    commandName = config.full;
    config = config.config;
  }

  var templateData = {
    cmdLines: getCommandLines(config),
    command: (commandName) ? commandName+' ' : '',
    optLines: getOptionLines()
  };

  log.write(handlebars.compile(helpTemplate)(templateData));
}

function getCommandLines(config){
  var longestCmd = 0;
  var cmds = [];
  var cmdLines = [];
  var addCmd = function(name, desc){
    longestCmd = Math.max(longestCmd, name.length);
    cmds.push({
      name: name,
      desc: desc || ''
    });
  };

  _.each(config, function(val, name){
    if (isCommandConfig(val)) {
      if (isMultiCommandConfig(val)) {
        name += ' [command]';
      }
      addCmd(name, val.desc);
    }
  });

  cmds.forEach(function(cmd){
    var spaces = new Array(6+longestCmd-cmd.name.length).join(' ');
    cmdLines.push(cmd.name+spaces+cmd.desc);
  });

  return cmdLines;
}

function isCommandConfig(cmdConfig){
  if (isMultiCommandConfig(cmdConfig)) {
    return true;
  } else if (cmdConfig.steps) {
    return true;
  }
  return false;
}

function isMultiCommandConfig(cmdConfig){
  if (typeof cmdConfig !== 'object') {
    return false;
  } else {
    return _.any(cmdConfig, 'steps');
  }
}

function getOptionLines(){
  var opts = [];
  var optLines = [];
  var longestOpt = 0;

  _.each(OPTIONS, function(val, name){
    var flags = getOptionFlags(name, val);
    longestOpt = Math.max(longestOpt, flags.length);
    opts.push({
      flags: flags,
      desc: val.desc || ''
    });
  });

  opts.forEach(function(opt){
    var spaces = new Array(6+longestOpt-opt.flags.length).join(' ');
    optLines.push(opt.flags+spaces+opt.desc);
  });

  return optLines;
}

function getOptionFlags(name, details){
  var flags = '';

  if (details.short) {
    flags += ('-'+details.short+', ');
  }

  flags += ('--'+name);

  if (details.arg) {
    flags += (' ['+details.arg+']');
  }

  return flags;
}