require('./worker')

arrayify= function(hash, callback){
	var array =[] ;
	for (i in hash){
		array.push( hash[i] )
	}
	callback(array)
}

loadInstitutions = function(callback){
	getInst(function(result){
		arrayify(result, function(a){
			callback(a, result)
		})
	})
}

loadSessions = function(i, callback){
	getSession(i, function(inst, result){
		arrayify(result, function(a){
			callback(a, result)
		})
	})
}

loadSubjects= function(inst, session, callback){
	getDept(inst, session, function(result){
		arrayify(result, function(a){
			callback(a, result)
		})
	})
}

loadClasses= function(inst, session, subject, callback){
	getSections(inst, session, subject, function(result){
		//console.log('\n\n\n got classes for '+inst+' '+session+' '+subject)
		//console.log(result)
		arrayify(result, function(a){
			callback(a, result)
		})
	})
}

runTheLoop = function (){
	/*if (cunyfirst is down){
		console.log('bad cunyfirst')
	}*/
	loadInstitutions(function (institutions, institutionsHash){
		uptoInstitution = institutions.length-1
		//put institutions into database
		checkSessions = function (inst){
			loadSessions (inst, function(sessions, sessionsHash){
				uptoSession= sessions.length-1
				//put sessions into database
				checkSubjects= function(inst, session){
					loadSubjects(inst, session, function(subjects, subjectsHash){
						uptoSubject = subjects.length-1
						//for each subject in each session in each instition get classes
						checkClasses= function (inst, session, subject){
							loadClasses(inst, session, subject, function(classes){
								//put classes into database
								if (uptoSubject>-1) checkClasses(inst, session, subjects[uptoSubject--])
								else if (uptoSession>-1) checkSubjects(inst, sessions[uptoSession--])
								else if (uptoInstitution>-1) checkSessions(institutions[uptoInstitution--])
							})
						}
						if (uptoSubject == subjects.length-1) checkClasses(inst, session, subjects[uptoSubject--]) //get started
					})
				}
				if (uptoSession == sessions.length-1) checkSubjects(inst, sessions[uptoSession--]) //get started
			})
		}
		if (uptoInstitution == institutions.length-1) checkSessions(institutions[uptoInstitution--]) //get started
	})
}
runTheLoop()
// I need to write functions for loadInstitutions, loadSessions, loadSubjects, loadClasses

