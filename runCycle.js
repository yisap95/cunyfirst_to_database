require('./worker')
var pg = require('pg');

arrayify= function(hash, callback){
	//puts values of a hash into an array
	var array =[] ;
	for (i in hash){
		array.push( hash[i] )
	}
	callback(array) //you don't really need to do this via callback, but whatever
}

function array_flip( trans )
{
    var key, tmp_ar = {};
    for ( key in trans )
    {
        if ( trans.hasOwnProperty( key ) )
        {
            tmp_ar[trans[key]] = key;
        }
    }
    return tmp_ar;
}

loadInstitutions = function(callback){
	getInst(function(result){
		delete result['The Graduate Center'] //because there are no classes here
		delete result['York College']
		delete result['School of Professional Studies']
		delete result['Queensborough CC']
		delete result['Queens College']
		delete result['NYC College of Technology']
		delete result['Medgar Evers College']
		delete result['Lehman College']
		delete result['LaGuardia Community College']
		delete result['Kingsborough CC']
		delete result['John Jay College']

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
			callback( a, array_flip(result) )
		})
	})
}

loadClasses= function(inst, session, subject, callback){
	//console.log("here are "+inst+session+subject)
	getSections(inst, session, subject, function(result){
		//console.log('\n\n\n got classes for '+inst+' '+session+' '+subject)
		//console.log(result)
		callback(result)
	})
}

putClassesInDatabase= function (inst, session, subject, classes){
	logger.log('time for '+inst+session+subject)
	//console.log(classes)
	if (Object.keys(classes).length == 0 ){
		console.log('empty')
		return
	}
	
	//console.log(classes)
	paramS = []
	for(classNbr in classes){
	    for (c in classes[classNbr]){
		    var data = classes[classNbr][c]
		    //params = [subject, data.Dept, data['Days & Times'], data.Room, data.Section, session, inst, data.Status==('Open'), data['Dates'], data.Instructor, classNbr, data.Topic, data.className]
		    
		    var m =data.Status==('Open')


		    param = "('"+subject +"', '"+ data.Dept +"', '"+ data['Days & Times']+"', '"+data.Room+"', '"+data.Section+"', '"+session+"', '"+inst+"', '"+m+"', '"+ data['Dates']+"', '"+data.Instructor+"', '"+classNbr+"', '"+data.Topic+"', '"+data.className+"')"
		    paramS.push(param)
		    
		}
	}
	pg.connect(process.env.DATABASE_URL, function(err, client, done) {
		if (err) {
			console.log(process.env.DATABASE_URL)
			console.log(err);
			pg.end();
			return;
		}
		//console.log('Connected to postgres! Getting schemas...');
		client.query("INSERT INTO classes_2 VALUES " + paramS.join(", "), [], function(err, result) {
		    if(err) {
		      err["Error"] = true;
		      console.error('error running query', err);
		      console.log(paramS)
		      done()
		    }
		    else{
		        done();
		    }
		})
    })
}

putSessionsInDatabase= function(inst, sessionsHash){
	//console.log(inst, sessionsHash)
	paramS = []
	for (i in sessionsHash){
		sessionsHash[i],
		param = "('"+i +"', '"+ sessionsHash[i] +"', '"+ inst+"')"
		paramS.push(param)
	}
		pg.connect(process.env.DATABASE_URL, function(err, client, done) {
		if (err) {
			console.log(process.env.DATABASE_URL)
			console.log(err);
			pg.end();
			return;
		}
		//console.log('Connected to postgres! Getting schemas...');
		client.query("INSERT INTO session2 VALUES " + paramS.join(", "), [], function(err, result) {
		    if(err) {
		      err["Error"] = true;
		      console.error('error running query', err);
		      console.log(paramS)
		      done()
		    }
		    else{
		        done();
		    }
		})
    })
}



runTheLoop = function (){
	/*if (cunyfirst is down){
		console.log('bad cunyfirst')
	}*/
	loadInstitutions(function (institutions, institutionsHash){
		uptoInstitution = institutions.length-1
		//putInstitutionsInDatabase(institutionsHash)//function to put institutions into database
		checkSessions = function (inst){
			loadSessions (inst, function(sessions, sessionsHash){
				uptoSession= sessions.length-1
				putSessionsInDatabase(inst, sessionsHash)
				checkSubjects= function(inst, session){
					loadSubjects(inst, session, function(subjects, subjectsHash){
						uptoSubject = subjects.length-1
						//for each subject in each session in each instition get classes
						checkClasses= function (inst, session, subject){
							loadClasses(inst, session, subject, function(classes){
								putClassesInDatabase(inst, session, subjectsHash[subject], classes)
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






