
ENV['PATH'] = './node_modules/.bin:' + ENV['PATH']


def compile(opts='')
  sh "coffee -c #{opts} app/*.coffee *.coffee"
end

desc "Compile the source."
task :watch do
  compile("-w")
end

task :compile do
  compile()
end

desc "Lint the source."
task :lint do
  sh 'coffeelint -f coffeelint.json  *.coffee app/*.coffee'
end

desc "Run supervisor."
task :supervisor => [:compile] do
  sh 'supervisor server.coffee'
end


task :default => :supervisor
