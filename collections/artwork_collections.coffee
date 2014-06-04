_ = require 'underscore'
Backbone = require 'backbone'
Artworks = require './artworks.coffee'
{ API_URL } = require('sharify').data
qs = require 'querystring'

class ArtworkCollection extends Backbone.Model

  defaults:
    private: false

  url: ->
    if @isNew()
      "#{API_URL}/api/v1/collection?user_id=#{@userId()}"
    else
      "#{API_URL}/api/v1/collection/#{@get 'id'}?user_id=#{@userId()}"

  initialize: ->
    @set name: 'My Favorite Works' if @get('id') is 'saved-artwork'
    @initArtworks()

  userId: ->
    @get('user_id') or @collection.user.get('id')

  saveArtwork: (artworkId, options = {}) ->
    new Backbone.Model().save {}, _.extend options,
      url: "#{API_URL}/api/v1/collection/#{@get 'id'}/artwork/#{artworkId}?user_id=#{@userId()}"

  removeArtwork: (artworkId, options ={}) ->
    new Backbone.Model(id: 1).destroy _.extend options,
      url: "#{API_URL}/api/v1/collection/#{@get 'id'}/artwork/#{artworkId}?user_id=#{@userId()}"

  initArtworks: ->
    @artworks = new Artworks
    @artworks.url = "#{API_URL}/api/v1/collection/#{@get 'id'}/artworks?user_id=#{@userId()}"

module.exports = class ArtworkCollections extends Backbone.Collection

  url: ->
    "#{API_URL}/api/v1/collections?" + qs.stringify(
      private: true
      bustCache: Math.random()
      user_id: @user.get 'id'
    )

  model: ArtworkCollection

  initialize: (models, { @user }) ->
    @on 'add', (col) => col.initArtworks()

module.exports.ArtworkCollection = ArtworkCollection