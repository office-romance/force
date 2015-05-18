benv = require 'benv'
Backbone = require 'backbone'
sinon = require 'sinon'
mediator = require '../../../lib/mediator.coffee'
Profile = require '../../../models/profile.coffee'
{ Following, FollowButton } = require '../index.coffee'
{ fabricate } = require 'antigravity'

describe 'FollowButton', ->

  before (done) ->
    benv.setup =>
      benv.expose { $: benv.require 'jquery' }
      sinon.stub Backbone, 'sync'
      @mediatorSpy = sinon.spy mediator, 'trigger'
      Backbone.$ = $
      done()

  after ->
    benv.teardown()
    Backbone.sync.restore()
    @mediatorSpy.restore()

  describe '#toggle without label', ->
    before ->
      @view = new FollowButton
        el: $("<div></div>")
        model: new Profile(fabricate 'fair_profile')
        modelName: 'profile'

    it 'triggers an auth modal with the model name as the label', ->
      @view.$el.click()
      @mediatorSpy.args[0][1].copy.should.equal 'Sign up to follow profiles'

  describe '#toggle with label', ->
    before ->
      @view = new FollowButton
        el: $("<div></div>")
        model: new Profile(fabricate 'fair_profile')
        modelName: 'profile'
        label: 'The Armory Show'

    it 'triggers an auth modal with the passed in label', ->
      @view.$el.click()
      @mediatorSpy.args[1][1].copy.should.equal 'Sign up to follow The Armory Show'


