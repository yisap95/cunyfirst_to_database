
var worker = require('./worker');
var pg = require('pg');
require('./database2')
var database_URL = process.env.DATABASE_URL;
pg.defaults.poolIdleTimeout = 2000;


/*(function myLoop (i) {          
   setTimeout(function () {   
      alert('hello');          //  your code here                
      if (--i) myLoop(i);      //  decrement i and call myLoop again if i > 0
   }, 3000)
})(10); */


/*getInst(function(q){
	for (i in q){
		
		setTimeout ( getSession('QNS01', function (r, m){
			console.log(i)
			console.log(m)
			console.log("____________________________")
			console.log("____________________________")
		}), 1000*60)
	}

})*/

allClasses = function (callback){
	getInst(function(inst){
		var institutionsArray= []
    var institutionsArray2= []
		for (i in inst){
      institutionsArray2.push({name: i, id: inst[i]})
			institutionsArray.push(inst[i])
		}
    //console.log(institutionsArray)
    

		allSessions(institutionsArray, function (array){
      //callback (institutionsArray2, array)
      //console.log("all sessions returns")
      //console.log(array)

			allSubjects (array, function(array1){
				console.log("there are "+array1.length + " stuffs ")
				allSections(array1, function(array2){
					console.log(array2)
				})
			})
		})
	});
}

allSessions = function (institutions, callback){
	var sessionArray= []
	var s= function sessionLoop (i) {      
   		setTimeout(function () {   
      	 getSession(institutions[--i], function (r, m){
          console.log('got institutions for '+institutions[i])
          console.log(m)
    				for (j in m){
    					var item = {inst: institutions[i], session: m[j], name:j}
    					sessionArray.push(item)
    				}
            if (i==0) callback(sessionArray)
         })              
   			if (i>0) sessionLoop(i);      //it's i>-1 because this way it'll try to iterate an extra time before the callback, buying us an extra 3 seconds
   			//else callback(sessionArray) //moved above
   		}, 1000*3)
	}; 
	s(institutions.length)
}


allSubjects = function (array, callback){
  console.log("array is here")
  console.log(array)
	var classArray= []
	var s= function sessionLoop (i) {      
   		setTimeout(function () {   
   			if (i>0){
   				getDept(array[--i].inst, array [i].session, function (m){
            console.log(m)
					   for (j in m){
				 	      var item = {inst: array[i].inst, session: array[i].session, subject: m[j], subject_name: j}
					      //console.log(item)
                //classArray.push(item)
					   }
             if (i == 0 ){
                console.log(classArray)
                callback(classArray)
             } 
             else sessionLoop(i)
				  })   
   			}       
   		}, 1000*3)
	}; 
	s(array.length)




}

allSections = function(array, callback){
        console.log("-----")
        //console.log(array)
        pg.connect(database_URL, function(err, client, done) {
          if(err) {
            err["Error"] = true;
            console.error('error running query', err);
            client.end();
          }
          var sectionsArray = []
          var s = function sectionLoop(i){
                setTimeout(function(){
                        getSections(array[--i].inst, array[i].session, array[i].subject, function(classData){
                                for(classNbr in classData){
                                        //console.log( classData[classNbr] )
                                        for (c in classData[classNbr]){
                                        	var data = classData[classNbr][c]
                                        	var tmp= array[i]
                                        	for (d in data){
                                        		tmp[d]= data[d]
                                        	}
                                          var classInfo = tmp
                                          params = [classInfo.subject_name, classInfo.subject, classInfo['Days & Times'], classInfo.Room, classInfo.Class, classInfo.session, classInfo.inst, classInfo.Status==('Open'), classInfo['Meeting Dates'], classInfo.Instructor, classNbr]
                                          putInDatabase(client, params, i, array.length)
                                          //console.log(params)
                                     }
                                }
                        })
                        setTimeout( function(){
                                if (i>0) sectionLoop(i);      //it's i>-1 because this way it'll try to iterate an extra time before the callback, buying us an extra 3 seconds
                                else {
                                        console.log("we're up to here")
                                        setTimeout( function () { done() }, 1000*1*10 )
                                        callback(sectionsArray)
                                }
                        },1000*6)
                });
        }
        s(array.length)
      })
}

var putInDatabase = function (client, params, a, outOf){
  paramas= params.slice()
  var classNum = [ paramas[4] ]
  console.log('class num is ')
  console.log(classNum)
  console.log('we dealing with '+a+' out of '+outOf )
  client.query("INSERT INTO classes VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)", paramas, function(err, result) {
    if(err) {
       err["Error"] = true;
       console.error('error running query2', err);
    }
  })
}


//getSections('QNS01', '1169', 'PHYS', function (m){
//	console.log(m)
//})


