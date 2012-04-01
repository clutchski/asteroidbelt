
ENV['PATH'] = './node_modules/.bin:' + ENV['PATH']

desc "Compile the source."
task :watch do
  sh 'coffee -cw static/*.coffee *.coffee'
end

task :compile do
  sh 'coffee -c *.coffee'
end

desc "Lint the source."
task :lint do
  sh 'coffeelint -f coffeelint.json  *.coffee'
end

desc "Run supervisor."
task :supervisor do
  sh 'supervisor smoketrail.server.js'
end


task :default => :run
