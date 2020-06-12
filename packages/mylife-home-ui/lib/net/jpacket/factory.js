'use strict';

// jrequest : id, type
// jresponse : id, type
// jres_data(jresponse) : data
// jres_error(jresponse) : message
// jres_success(jresponse)
// jreq_enum(jrequest)
// jreq_get(jrequest) : key
// jreq_hash(jrequest) : keys
// jreq_set(jrequest) : key, value
// jres_success::type_def = "success";
// jres_error::type_def = "error";
// jreq_enum::type_def = "enum";
// jreq_enum::response_type_def = "rs_enum";
// jreq_get::type_def = "get";
// jreq_get::response_type_def = "rs_get";
// jreq_hash::type_def = "hash";
// jreq_hash::response_type_def = "rs_hash";
// jreq_set::type_def = "set";
// jreq_set::response_type_def = "rs_set";

// core::jreq_components::type_def = "components";
// core::jreq_components::response_type_def = "rs_components";
// core::jreq_plugins::type_def = "plugins";
// core::jreq_plugins::response_type_def = "rs_plugins";
// core::jreq_comp_create::type_def = "comp_create";
// core::jreq_comp_delete::type_def = "comp_delete";
// core::jreq_comp_bind::type_def = "comp_bind";
// core::jreq_comp_unbind::type_def = "comp_unbind";
// core::jreq_comp_set_designer::type_def = "comp_set_designer";

// session_list, session_kill

function resourcesEnum(client, cb, nick) {
  return client.execute({
    type : 'enum'
  }, (err, res) => {
    if(err) { return cb(err); }
    if(res.type === 'error') { return cb(res.message); }
    return cb(undefined, res.data);
  }, nick);
}

function resourcesGet(client, key, cb, nick) {
  return client.execute({
    type : 'get',
    key  : key
  }, (err, res) => {
    if(err) { return cb(err); }
    if(res.type === 'error') { return cb(res.message); }
    return cb(undefined, res.data);
  }, nick);
}

function resourcesHash(client, keys, cb, nick) {
  return client.execute({
    type : 'hash',
    keys : keys
  }, (err, res) => {
    if(err) { return cb(err); }
    if(res.type === 'error') { return cb(res.message); }
    return cb(undefined, res.data);
  }, nick);
}

function corePlugins(client, cb, nick) {
  return client.execute({
    type : 'plugins'
  }, (err, res) => {
    if(err) { return cb(err); }
    if(res.type === 'error') { return cb(res.message); }
    return cb(undefined, res.data);
  }, nick);
}

function coreComponents(client, cb, nick) {
  return client.execute({
    type : 'components'
  }, (err, res) => {
    if(err) { return cb(err); }
    if(res.type === 'error') { return cb(res.message); }
    return cb(undefined, res.data);
  }, nick);
}

module.exports = {

  extendsClient : function(client) {
    client.resourcesEnum  = resourcesEnum.bind(undefined, client);
    client.resourcesGet   = resourcesGet.bind(undefined, client);
    client.resourcesHash  = resourcesHash.bind(undefined, client);
    client.corePlugins    = corePlugins.bind(undefined, client);
    client.coreComponents = coreComponents.bind(undefined, client);
  },

  createError : function(message) {
    return {
      type    : 'error',
      message : message
    };
  },

  createSuccess : function() {
    return {
      type : 'success'
    };
  },

  createSessionList : function(list) {
    return {
      type : 'rs_session_list',
      data : list
    };
  },

  createResourcesEnum : function(list) {
    return {
      type : 'rs_enum',
      data : list
    };
  },

  createResourcesGet : function(data) {
    return {
      type : 'rs_get',
      data : data
    };
  },

  createResourcesHash : function(data) {
    return {
      type : 'rs_hash',
      data : data
    };
  },

  createComponentList : function(list) {
    return {
      type : 'rs_components',
      data : list
    };
  },

  createPluginList : function(list) {
    return {
      type : 'rs_plugins',
      data : list
    };
  },

  createSysInfo : function(data) {
    return {
      type : 'rs_sysinfo',
      data
    };
  }
};
