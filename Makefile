GIT_BRANCH=

branch:	
	$(eval GIT_BRANCH=$(shell git rev-parse --abbrev-ref HEAD))

git-%: 	branch
	git commit -m "$(@:git-%=%)"
	git push origin $(GIT_BRANCH)

add: public/ views/ clean
	git add public/.
	git add views/.
	git add Makefile

clean:
	rm -f views/*#*
	rm -f public/*/*#*
