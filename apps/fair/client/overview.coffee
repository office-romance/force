_ = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data
Clock = require '../../../components/clock/view.coffee'
FeedItems = require '../../../components/feed/collections/feed_items.coffee'
FeedView = require '../../../components/feed/client/feed.coffee'
Artists = require '../../../collections/artists.coffee'
mediator = require '../../../lib/mediator.coffee'
analytics = require '../../../lib/analytics.coffee'
ForYouView = require './for_you.coffee'
{ Following, FollowButton } = require '../../../components/follow_button/index.coffee'
forYouTemplate = -> require('../templates/for_you_logged_in.jade') arguments...
fairOverviewTop = -> require('../templates/overview_top.jade')

module.exports = class Overview extends Backbone.View

  initialize: (options) ->
    @fair = options.fair
    @user = options.user
    @renderClock()
    @setupFollowButton()

  renderClock: ->
    @clock = new Clock
      modelName: "Fair"
      model: @fair
      el: @$('.clock')
    @clock.start()

  renderFollowedArtistList: ->
    url = "#{sd.API_URL}/api/v1/me/follow/artists"
    data = fair_id: @fair.get('id')
    followingArtists = new Artists()
    followingArtists.fetchUntilEnd
      url: url
      data: data
      success: =>
        @onFetchFollowingArtists followingArtists

  onFetchFollowingArtists: (followingArtists) =>
    artistNames = @formatArtists followingArtists, 2
    if artistNames
      analytics.track.click "Display following artists at the fair"
      @$('.container-left .large-section-subheading').text "Works by #{artistNames}"

  formatArtists: (followArtists, max=Infinity) ->
    return unless followArtists?.length
    artists = followArtists.map (followArtist) ->
      artist = followArtist.get('artist')
      return artist.name

    if artists?.length < 2
      "#{artists.join(', ')}"
    else if artists?.length <= max
      "#{artists[0..(artists.length - 2)].join(', ')} and #{artists[artists?.length - 1]}"
    else
      "#{artists[0..(max-1)].join(', ')} and #{artists[(max-1)..].length - 1} more"

  setupFollowButton: ->
    @following = new Following(null, kind: 'profile') if @user
    new FollowButton
      el: @$('#fair-follow-button')
      following: @following
      modelName: 'profile'
      model: @model
      label: @model.name
      analyticsFollowMessage: 'Followed fair, via fair microsite page'
      analyticsUnfollowMessage: 'Unfollowed fair, via fair microsite page'
    @following?.syncFollows [@model.id]


