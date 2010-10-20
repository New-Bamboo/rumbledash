var Team = Model('team', 
  // class methods
  {
    
    with_collaborator_id: function(id){
      return Team.detect(function(){
        return this.collaborator_ids().indexOf(id) > -1;
      });
    },
    
    tick: function () {
      Team.each(function(){
        this.trigger('tick');
      });
    }
  },
  // Instance methods
  { 
    collaborators: function () {
      return this.attr('collaborators');
    },
    
    opacity: function () {
      return this.attr('opacity') || 0;
    },
    
    commits: function () {
      return Commit.find_by_repository(this.attr('repo'))
    }
  }
);