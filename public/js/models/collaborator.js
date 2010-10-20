var Collaborator = Model('collaborator', 
  // class methods
  {
    
    find_by_twitter_name: function (name) {
      return this.detect(function () {
        return this.attr('twitter_name') == name;
      });
    },
    
    find_by_irc_name: function (name) {
      return this.detect(function () {
        return this.attr('irc_name') == name;
      });
    },
    
    find_by_github_name: function (name) {
      return this.detect(function () {
        return this.attr('github_name') == name;
      });
    }
  },
  // Instance methods
  {
    team: function () {
      return Team.with_collaborator_id(this.id())
    },
    
    gravatar_url: function(){
      return "http://www.gravatar.com/avatar/"+this.attr('gravatar')+".png"
    }
  }
);