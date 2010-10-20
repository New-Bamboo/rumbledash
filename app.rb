require 'rubygems'
require "bundler/setup"

require 'sinatra/base'
require 'digest/md5'

class App < Sinatra::Base
  
  set :root, File.dirname(__FILE__)
  enable :static
  set :public, Proc.new { File.join(root, "public") }
    
  helpers do
  
    def cache_long(seconds = 300)
      response['Cache-Control'] = "public, max-age=#{seconds}"
    end
    
    def gravatar(email)
      "http://www.gravatar.com/avatar/#{Digest::MD5.hexdigest(email)}.png"
    end
    
  end
  
  get '/?' do
    cache_long
    erb :teams, :layout => false    
  end
  
  # fake api
  get '/api' do
    content_type 'text/javascript'
    erb :"api.js.erb"
  end
  
end