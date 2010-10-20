var Commit = Model('commit',
  // Class methods
  {
    unique_key: 'commitHash',
    
    loadData: function (data) {
      $.each(data, function (i, e) {
        Commit.add(new Commit(e))
      })
    },
    
    find_by_repository: function( repo ){
      return Commit.select(function(){
        return this.attr('repository') == repo
      }).all();
    }
  },
  // instance methods
  {
    team: function () {
      if(this._team) return this._team;
      var self = this;
      this._team = Team.detect( function () {
        return this.attr('repo') == self.attr('repository');
      });
      return this._team;
    },
    
    link: function () {
      return 'http://github.com/railsrumble/' + this.attr('repository') + '/commit/' + this.attr('commitHash')
    }
  }
);