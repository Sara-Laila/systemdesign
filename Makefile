GIT_BRANCH=

all:
	npm install
	node app.js

edit: 	public/ views/  clean
	emacsclient public/css/* views/* public/js/*

branch:	
	$(eval GIT_BRANCH=$(shell git rev-parse --abbrev-ref HEAD))

git-%: 	branch
	git commit -m "$(@:git-%=%)"
	git push origin $(GIT_BRANCH)

branch-%: clean
	rm -rf node_modules/
	git checkout "$(@:branch-%=%)"

add: public/ views/ clean
	git add public/.
	git add views/.
	git add Makefile

clean:

	rm -rf node_modules/ *#* *~*
	rm -f views/*#* views/*~*
	rm -f public/*/*~* public/*/*#*

.PHONY = all branch
