/* REFERENCE TEMPLATE: the owner maintains the live script in Google Apps Script.
   This file does not automatically synchronize with the live Google deployment.
   Configure Script Properties using SETUP.md before deploying a separate copy. */
function doPost(e) {
  try {
    var p=PropertiesService.getScriptProperties(), d=JSON.parse(e.postData.contents||'{}');
    if(d.website || !d.consent) throw Error('Invalid request.');
    var cfg=JSON.parse(p.getProperty('CATALOGUE_JSON')||'{}');
    ['name','phone','service','handover'].forEach(function(k){if(typeof d[k]!=='string'||!d[k].trim()||d[k].length>200)throw Error('Missing or invalid '+k);});
    if(d.name.length>80||!/^\+234[789]\d{9}$/.test(d.phone)||!(cfg.services||[]).some(function(s){return s.id===d.service;})||!['dropoff','pickup'].includes(d.handover))throw Error('Invalid booking details.');
    if(d.handover==='pickup'){
      ['date','time','area','address','landmark'].forEach(function(k){if(typeof d[k]!=='string'||!d[k].trim()||d[k].length>200)throw Error('Missing '+k);});
      if(!(cfg.areas||[]).includes(d.area)||!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||!/^\d{2}:\d{2}$/.test(d.time))throw Error('Invalid pick-up.');
      var pickup=new Date(d.date+'T'+d.time+':00+01:00'), now=new Date(), lagosDay=Number(Utilities.formatDate(pickup,'Africa/Lagos','u')), hh=Number(d.time.slice(0,2)), mm=Number(d.time.slice(3));
      var today=Utilities.formatDate(now,'Africa/Lagos','yyyy-MM-dd'), max=Utilities.formatDate(new Date(now.getTime()+14*86400000),'Africa/Lagos','yyyy-MM-dd');
      if(isNaN(pickup.getTime())||lagosDay===7||d.date<today||d.date>max||pickup.getTime()<now.getTime()+3*3600000||hh<8||hh>21||(hh===21&&mm!==0)||![0,30].includes(mm))throw Error('Pick-up time is unavailable.');
    }
    if(!d.challenge)throw Error('Human verification is required.');
    var verified=JSON.parse(UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'post',payload:{secret:p.getProperty('TURNSTILE_SECRET'),response:d.challenge}}).getContentText());
    if(!verified.success || verified.hostname!==p.getProperty('ALLOWED_HOSTNAME'))throw Error('Human verification failed.');
    var lock=LockService.getScriptLock();lock.waitLock(30000);
    var reference, cache=CacheService.getScriptCache(), key=Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,d.phone));
    try{
      var recent=cache.get(key); if(recent) return json_({success:true,reference:recent});
      var counter=Number(p.getProperty('NEXT_REFERENCE')||1);reference='LD-'+String(counter).padStart(5,'0');p.setProperty('NEXT_REFERENCE',String(counter+1));
      var safe=function(v){v=String(v||'').slice(0,200);return /^[=+\-@]/.test(v)?"'"+v:v;};
      var pickupFields=d.handover==='pickup'?[d.date,d.time,d.area,d.address,d.landmark]:['','','','',''];
      var row=[reference,Utilities.formatDate(new Date(),'Africa/Lagos','yyyy-MM-dd HH:mm:ss'),d.name,d.phone,d.service,d.handover].concat(pickupFields).map(safe);
      var saved=false, emailed=false;
      try{var sheet=SpreadsheetApp.openById(p.getProperty('SHEET_ID')).getSheetByName('Bookings');sheet.appendRow(row);saved=true;}catch(sheetError){console.error('Sheet delivery failed: '+reference);}
      try{MailApp.sendEmail({to:p.getProperty('OWNER_EMAIL'),subject:'New laundry booking — '+reference,body:['New booking request',reference].concat(row).join('\n')+'\n\nConfirm the price and arrangements with the customer. Payment is due before clothes are released.'});emailed=true;}catch(mailError){console.error('Email delivery failed: '+reference);}
      if(!saved&&!emailed)throw Error('Delivery failed. Please contact us on WhatsApp.');
      cache.put(key,reference,120);return json_({success:true,reference:reference});
    }finally{lock.releaseLock();}
  }catch(err){return json_({success:false,message:String(err.message||'Please try again.')});}
}
function json_(v){return ContentService.createTextOutput(JSON.stringify(v)).setMimeType(ContentService.MimeType.JSON);}
function setupSheet(){var p=PropertiesService.getScriptProperties(), ss=SpreadsheetApp.openById(p.getProperty('SHEET_ID'));var sheet=ss.getSheetByName('Bookings')||ss.insertSheet('Bookings');if(sheet.getLastRow())throw Error('Bookings tab already contains data.');sheet.appendRow(['Reference','Time booked','Name','Phone','Service','Drop-off / Pick-up','Pick-up date','Pick-up time','Area','Address','Landmark','Status','Price (₦)','Paid?','Owner notes']);sheet.setFrozenRows(1);sheet.getRange('N2:N1000').insertCheckboxes();}
