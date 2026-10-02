import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

const LanguageContext = createContext({
  language: "en",
  changeLanguage: () => {},
  t: (key) => key,
  translate: (text) => text
});

const contentTranslations = {
  "How It Works": "ఎలా పనిచేస్తుంది",
  "Work Categories": "పని విభాగాలు",
  "Built for agriculture.": "వ్యవసాయం కోసం రూపొందించబడింది.",
  "Farmer Portal": "రైతు విభాగం",
  Farmer: "రైతు",
  Worker: "కార్మికుడు",
  "Farm Owner": "పొలం యజమాని",
  "Find Workers": "కార్మికులను కనుగొనండి",
  "Hire farm workers": "వ్యవసాయ కార్మికులను నియమించుకోండి",
  "Hiring History": "నియామకాల చరిత్ర",
  "View worker selections": "ఎంచుకున్న కార్మికులను చూడండి",
  "Disease Detection": "పంట వ్యాధుల గుర్తింపు",
  "Check crop health": "పంట ఆరోగ్యాన్ని పరిశీలించండి",
  "My Jobs": "నా పనులు",
  "Manage your jobs": "మీ పనులను నిర్వహించండి",
  "Post jobs and review worker applications.":
    "పనులను నమోదు చేసి కార్మికుల దరఖాస్తులను పరిశీలించండి.",
  "Post a Job": "పనిని నమోదు చేయండి",
  "Posting job...": "పనిని నమోదు చేస్తోంది...",
  Accept: "అంగీకరించండి",
  Reject: "తిరస్కరించండి",
  "Posted Jobs": "నమోదు చేసిన పనులు",
  "Loading your jobs...": "మీ పనులను లోడ్ చేస్తోంది...",
  "You have not posted any jobs yet.": "మీరు ఇంకా పనులను నమోదు చేయలేదు.",
  Applications: "దరఖాస్తులు",
  "No workers have applied yet.": "ఇంకా ఏ కార్మికుడూ దరఖాస్తు చేయలేదు.",
  "Please log in with the farmer mobile number before managing jobs.":
    "పనులను నిర్వహించడానికి రైతు మొబైల్ నంబర్‌తో లాగిన్ అవ్వండి.",
  "Could not load your jobs.": "మీ పనులను లోడ్ చేయలేకపోయాం.",
  "Could not load job applications.": "పని దరఖాస్తులను లోడ్ చేయలేకపోయాం.",
  "Could not post the job.": "పనిని నమోదు చేయలేకపోయాం.",
  "Could not post the job. Please enable location and try again.":
    "పనిని నమోదు చేయలేకపోయాం. ప్రదేశ అనుమతి ఇచ్చి మళ్లీ ప్రయత్నించండి.",
  "Job posted successfully.": "పని విజయవంతంగా నమోదు అయింది.",
  "Could not update this application.": "ఈ దరఖాస్తును నవీకరించలేకపోయాం.",
  "Worker application accepted.": "కార్మికుడి దరఖాస్తు ఆమోదించబడింది.",
  "Worker application rejected.": "కార్మికుడి దరఖాస్తు తిరస్కరించబడింది.",
  "A worker applied for one of your jobs.":
    "మీ పనుల్లో ఒకదానికి కార్మికుడు దరఖాస్తు చేశారు.",
  "A worker marked the job as completed.":
    "కార్మికుడు పని పూర్తయిందని నమోదు చేశారు.",
  "Apply for Job": "పని కోసం దరఖాస్తు చేయండి",
  "Applying...": "దరఖాస్తు చేస్తోంది...",
  "Application pending": "దరఖాస్తు పెండింగ్‌లో ఉంది",
  "Application accepted": "దరఖాస్తు ఆమోదించబడింది",
  "Application rejected": "దరఖాస్తు తిరస్కరించబడింది",
  "Job completed": "పని పూర్తయింది",
  "My Applications": "నా దరఖాస్తులు",
  "You have not applied for any jobs yet.": "మీరు ఇంకా ఏ పనికీ దరఖాస్తు చేయలేదు.",
  "Your application was sent to the farmer.": "మీ దరఖాస్తు రైతుకు పంపబడింది.",
  "Could not submit your application. Please try again.":
    "మీ దరఖాస్తును పంపలేకపోయాం. మళ్లీ ప్రయత్నించுங்கள்.",
  "Mark Job Complete": "పని పూర్తయిందని గుర్తించండి",
  "Completing...": "పూర్తి చేస్తోంది...",
  "Job marked as completed.": "పని పూర్తయినట్లు నమోదు అయింది.",
  "Could not complete the job. Please try again.":
    "పనిని పూర్తి చేయలేకపోయాం. మళ్లీ ప్రయత్నించுங்கள்.",
  "Only the accepted worker can complete an active job.":
    "పని అంగీకరించిన కార్మికుడు మాత్రమే దాన్ని పూర్తిచేయగలరు.",
  "Farmer account not found.": "రైతు ఖాతా కనుగొనబడలేదు.",
  "A valid farmer phone is required.": "చెల్లుబాటు అయ్యే రైతు ఫోన్ నంబర్ అవసరం.",
  "A valid job id and farmer phone are required.":
    "చెల్లుబాటు అయ్యే పని నంబర్, రైతు ఫోన్ అవసరం.",
  "Job not found for this farmer.": "ఈ రైతుకు సంబంధించిన పని కనుగొనబడలేదు.",
  "A valid worker phone is required.": "చెల్లుబాటు అయ్యే కార్మికుడి ఫోన్ నంబర్ అవసరం.",
  "A valid job id and worker phone are required.":
    "చెల్లుబాటు అయ్యే పని నంబర్, కార్మికుడి ఫోన్ అవసరం.",
  "This job is no longer accepting applications.":
    "ఈ పనికి ఇక దరఖాస్తులు స్వీకరించడం లేదు.",
  "Worker profile not found.": "కార్మికుడి ప్రొఫైల్ కనుగొనబడలేదు.",
  "You have already applied for this job.": "ఈ పనికి మీరు ఇప్పటికే దరఖాస్తు చేశారు.",
  "This job has already been assigned or closed.":
    "ఈ పని ఇప్పటికే కేటాయించబడింది లేదా మూసివేయబడింది.",
  "This application is no longer pending.":
    "ఈ దరఖాస్తు ఇక పెండింగ్‌లో లేదు.",
  pending: "పెండింగ్‌లో ఉంది",
  accepted: "ఆమోదించబడింది",
  rejected: "తిరస్కరించబడింది",
  completed: "పూర్తయింది",
  open: "తెరిచి ఉంది",
  closed: "మూసివేయబడింది",
  Notifications: "నోటిఫికేషన్లు",
  "Latest updates": "తాజా సమాచారం",
  Settings: "సెట్టింగ్‌లు",
  "Account settings": "ఖాతా సెట్టింగ్‌లు",
  Logout: "లాగ్ అవుట్",
  "Sign out": "సైన్ అవుట్",
  "Welcome back 👋": "తిరిగి స్వాగతం 👋",
  "Farmer Dashboard": "రైతు డాష్‌బోర్డ్",
  "Find the right workers for your farm quickly and easily.":
    "మీ పొలానికి సరైన కార్మికులను త్వరగా, సులభంగా కనుగొనండి.",
  "Available Workers": "అందుబాటులో ఉన్న కార్మికులు",
  "Demo statistics": "నమూనా గణాంకాలు",
  "Active Jobs": "ప్రస్తుతం జరుగుతున్న పనులు",
  "Currently running": "ప్రస్తుతం కొనసాగుతున్నవి",
  "Completed Jobs": "పూర్తయిన పనులు",
  "This season": "ఈ సీజన్‌లో",
  "Worker Rating": "కార్మికుల రేటింగ్",
  "Average rating": "సగటు రేటింగ్",
  "Hiring history": "నియామకాల చరిత్ర",
  "Worker selections and SMS delivery status for this account.":
    "ఈ ఖాతాలో ఎంచుకున్న కార్మికులు, SMS పంపిన స్థితి.",
  "No worker selections yet.": "ఇంకా కార్మికులను ఎంచుకోలేదు.",
  "Worker phone:": "కార్మికుడి ఫోన్:",
  "Selected:": "ఎంచుకున్న తేదీ:",
  "Status:": "స్థితి:",
  "SMS Sent": "SMS పంపబడింది",
  Accepted: "అంగీకరించబడింది",
  "Not sent": "పంపబడలేదు",
  "Find Agricultural Workers": "వ్యవసాయ కార్మికులను కనుగొనండి",
  "Enter your farm details to find suitable workers.":
    "మీకు సరిపోయే కార్మికులను కనుగొనడానికి పొలం వివరాలు నమోదు చేయండి.",
  "🌱 Farm Information": "🌱 పొలం వివరాలు",
  "Crop Type": "పంట రకం",
  "Select crop": "పంటను ఎంచుకోండి",
  "Paddy": "వరి",
  "Wheat": "గోధుమ",
  "Cotton": "పత్తి",
  "Chilli": "మిరప",
  "Sugarcane": "చెరకు",
  "Land Area": "భూమి విస్తీర్ణం",
  "Enter acres": "ఎకరాలు నమోదు చేయండి",
  Acres: "ఎకరాలు",
  "Estimated workers required": "అవసరమయ్యే కార్మికుల అంచనా",
  "Select crop and land area": "పంట, భూమి విస్తీర్ణం ఎంచుకోండి",
  "workers per acre for": "ప్రతి ఎకరానికి కార్మికులు —",
  "✓ Calculated": "✓ లెక్కించబడింది",
  "🧑‍🌾 Work Details": "🧑‍🌾 పని వివరాలు",
  "Work Type": "పని రకం",
  "Select work type": "పని రకాన్ని ఎంచుకోండి",
  Seeding: "విత్తనాలు వేయడం",
  "Irrigation Setup": "నీటిపారుదల ఏర్పాటు",
  "Pesticide Spraying": "పురుగుమందు పిచికారీ",
  Pruning: "కొమ్మల కత్తిరింపు",
  Harvesting: "పంట కోత",
  "Tractor Driving": "ట్రాక్టర్ నడపడం",
  "Work Date": "పని తేదీ",
  "Work Location": "పని ప్రదేశం",
  "Enter village / area": "గ్రామం / ప్రాంతం నమోదు చేయండి",
  "Daily Wage": "రోజువారీ కూలి",
  "e.g. 500": "ఉదా. 500",
  "per day": "రోజుకు",
  Clear: "తొలగించండి",
  "🔎 Find Workers": "🔎 కార్మికులను కనుగొనండి",
  "SEARCH RESULTS": "శోధన ఫలితాలు",
  "matching workers found for": "సరిపోయే కార్మికులు కనుగొనబడ్డారు:",
  "Skill match": "నైపుణ్య సరిపోలిక",
  Found: "కనుగొనబడ్డారు",
  Crop: "పంట",
  "Workers Required": "అవసరమైన కార్మికులు",
  "Workers Found": "కనుగొన్న కార్మికులు",
  Available: "అందుబాటులో ఉన్నారు",
  "years experience": "సంవత్సరాల అనుభవం",
  "View Profile": "ప్రొఫైల్ చూడండి",
  "✓ Selected": "✓ ఎంచుకున్నారు",
  "Sending SMS...": "SMS పంపుతోంది...",
  "Hire Worker": "కార్మికుడిని నియమించుకోండి",
  "No matching workers found": "సరిపోయే కార్మికులు ఎవరూ లేరు",
  "Try changing the crop type or work type to see other available workers.":
    "ఇతర కార్మికులను చూడటానికి పంట రకం లేదా పని రకాన్ని మార్చండి.",
  Rating: "రేటింగ్",
  Experience: "అనుభవం",
  Age: "వయస్సు",
  Skills: "నైపుణ్యాలు",
  "Hire This Worker": "ఈ కార్మికుడిని నియమించుకోండి",
  "Please complete all required fields.": "అవసరమైన అన్ని వివరాలను నమోదు చేయండి.",
  "is already selected.": "ఇప్పటికే ఎంపికయ్యారు.",
  "Please log in with the farmer mobile number before hiring a worker.":
    "కార్మికుడిని నియమించుకునే ముందు రైతు మొబైల్ నంబర్‌తో లాగిన్ అవ్వండి.",
  "No response from the backend. Check that the backend is running and try again.":
    "సర్వర్ నుంచి స్పందన లేదు. సర్వర్ నడుస్తుందో చూసి మళ్లీ ప్రయత్నించండి.",
  "SMS sent.": "SMS పంపబడింది.",
  "Worker accepted your job.": "కార్మికుడు మీ పనిని అంగీకరించారు.",
  "Workers accepted": "పని అంగీకరించిన కార్మికులు",
  "Workers who accepted your jobs": "మీ పనులను అంగీకరించిన కార్మికుల వివరాలు",
  "Worker applications and accepted jobs": "కార్మికుల దరఖాస్తులు మరియు ఆమోదించిన పనులు",
  "New worker applications": "కార్మికుల కొత్త దరఖాస్తులు",
  "Worker phone": "కార్మికుడి ఫోన్",
  "Review in My Jobs": "నా పనుల్లో పరిశీలించండి",
  "applied for one of your jobs.": "మీ పనుల్లో ఒకదానికి దరఖాస్తు చేశారు.",
  "No workers have accepted your jobs yet.":
    "ఇంకా మీ పనులను ఏ కార్మికుడూ అంగీకరించలేదు.",
  "No worker applications or accepted jobs yet.":
    "ఇంకా కార్మికుల దరఖాస్తులు లేదా అంగీకరించిన పనులు లేవు.",
  "Worker profile": "కార్మికుడి ప్రొఫైల్",
  "Accepted job": "అంగీకరించిన పని",
  "Job title": "పని పేరు",
  "Agreed daily wage": "అంగీకరించిన రోజువారీ కూలి",
  "Job accepted": "పని అంగీకరించబడింది",
  "Add New Worker": "కొత్త కార్మికుడిని జోడించండి",
  "Add Worker": "కార్మికుడిని జోడించండి",
  "Enter the new worker's details to add them to the dashboard.":
    "కొత్త కార్మికుడి వివరాలను నమోదు చేసి డాష్‌బోర్డ్‌కు జోడించండి.",
  "Plant Disease Detection": "మొక్కల వ్యాధుల గుర్తింపు",
  "Upload a clear photo of a crop leaf to check for common diseases.":
    "సాధారణ వ్యాధులను గుర్తించడానికి పంట ఆకు స్పష్టమైన ఫోటోను అప్‌లోడ్ చేయండి.",
  "Select a leaf image": "ఆకు చిత్రాన్ని ఎంచుకోండి",
  "Supported formats: JPG, PNG, WebP. Maximum size: 10 MB.":
    "అనుమతించే ఫార్మాట్‌లు: JPG, PNG, WebP. గరిష్ట పరిమాణం: 10 MB.",
  "Analyze image": "చిత్రాన్ని విశ్లేషించండి",
  "Analyzing image...": "చిత్రాన్ని విశ్లేషిస్తోంది...",
  "Choose an image before analyzing.": "విశ్లేషణకు ముందు చిత్రాన్ని ఎంచుకోండి.",
  "Image must be 10 MB or smaller.": "చిత్ర పరిమాణం 10 MB లేదా అంతకంటే తక్కువగా ఉండాలి.",
  "Disease analysis failed. Please try again.":
    "వ్యాధి విశ్లేషణ విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.",
  "The disease analysis service rejected the image.":
    "వ్యాధి విశ్లేషణ సేవ ఈ చిత్రాన్ని అంగీకరించలేదు.",
  "The disease analysis service could not process the image.":
    "వ్యాధి విశ్లేషణ సేవ చిత్రాన్ని ప్రాసెస్ చేయలేకపోయింది.",
  "The disease analysis service could not be reached.":
    "వ్యాధి విశ్లేషణ సేవను సంప్రదించలేకపోయాం.",
  "Only JPEG, PNG, and WebP images are accepted.":
    "JPEG, PNG, WebP చిత్రాలను మాత్రమే అప్‌లోడ్ చేయవచ్చు.",
  "Analysis result": "విశ్లేషణ ఫలితం",
  "View prediction history": "విశ్లేషణ చరిత్రను చూడండి",
  "Disease prediction history": "వ్యాధి విశ్లేషణ చరిత్ర",
  "No disease predictions saved yet.": "ఇంకా వ్యాధి విశ్లేషణలు సేవ్ కాలేదు.",
  "Saved prediction history could not be loaded.":
    "సేవ్ చేసిన విశ్లేషణ చరిత్రను తెరవలేకపోయాం.",
  "Analysis completed, but its history could not be saved.":
    "విశ్లేషణ పూర్తయింది, కానీ చరిత్రను సేవ్ చేయలేకపోయాం.",
  "Analyze another image": "మరో చిత్రాన్ని విశ్లేషించండి",
  "Image": "చిత్రం",
  "Job details": "పని వివరాలు",
  "Loading job details...": "పని వివరాలు లోడ్ అవుతున్నాయి...",
  "This job is no longer available.": "ఈ పని ప్రస్తుతం అందుబాటులో లేదు.",
  "Could not load job details.": "పని వివరాలను లోడ్ చేయలేకపోయాం.",
  "Required skill": "అవసరమైన నైపుణ్యం",
  "Description": "వివరణ",
  "Workers needed": "అవసరమైన కార్మికులు",
  "Not specified": "పేర్కొనలేదు",
  "No additional details.": "అదనపు వివరాలు లేవు.",
  "Job location": "పని ప్రదేశం",
  "Map coordinates are unavailable for this location.":
    "ఈ ప్రదేశానికి మ్యాప్ కోఆర్డినేట్లు అందుబాటులో లేవు.",
  "Open map in OpenStreetMap": "OpenStreetMapలో మ్యాప్‌ను తెరవండి",
  "Contact farmer": "రైతును సంప్రదించండి",
  "Back to available jobs": "అందుబాటులో ఉన్న పనులకు తిరిగి వెళ్లండి",
  "🎙️ Speak": "🎙️ మాట్లాడండి",
  "Listening...": "వింటోంది...",
  "Voice input is not supported by this browser.":
    "ఈ బ్రౌజర్‌లో వాయిస్ ఇన్‌పుట్‌కు మద్దతు లేదు.",
  Disease: "వ్యాధి",
  "Selected crop leaf": "ఎంచుకున్న పంట ఆకు",
  Confidence: "నమ్మక స్థాయి",
  Symptoms: "లక్షణాలు",
  "Prevention and management": "నివారణ మరియు నిర్వహణ",
  "Treatment guidance": "చికిత్స సూచనలు",
  "AI predictions are for guidance only. Confirm the diagnosis with a local agricultural expert before treatment.":
    "AI అంచనాలు సూచన కోసం మాత్రమే. చికిత్సకు ముందు స్థానిక వ్యవసాయ నిపుణుడితో నిర్ధారించుకోండి.",
  "The uploaded image could not be analyzed. Please use a clear crop leaf photo.":
    "అప్‌లోడ్ చేసిన చిత్రాన్ని విశ్లేషించలేకపోయాం. స్పష్టమైన పంట ఆకు ఫోటోను ఉపయోగించండి.",
  "← Farmer Dashboard": "← రైతు డాష్‌బోర్డ్",
  "Healthy plant": "ఆరోగ్యమైన మొక్క",
  "Healthy chilli leaf": "ఆరోగ్యమైన మిరప ఆకు",
  "Chilli leaf curl": "మిరప ఆకు ముడత",
  "Chilli leaf spot": "మిరప ఆకు మచ్చ",
  "Chilli whitefly infestation": "మిరప తెల్లదోమ ఉధృతి",
  "Yellowing chilli leaf": "మిరప ఆకు పసుపు రంగులోకి మారడం",
  "Healthy cotton": "ఆరోగ్యమైన పత్తి",
  "Cotton bacterial blight": "పత్తి బాక్టీరియా ఆకుమచ్చ తెగులు",
  "Cotton leaf curl virus": "పత్తి ఆకు ముడత వైరస్",
  "Cotton Fusarium wilt": "పత్తి ఫ్యూజేరియం ఎండు తెగులు",
  "Healthy paddy": "ఆరోగ్యమైన వరి",
  "Rice brown spot": "వరి గోధుమ మచ్చ తెగులు",
  "Rice leaf smut / smut-like leaf symptoms": "వరి ఆకు సూట్ / సూట్ వంటి లక్షణాలు",
  "Rice bacterial leaf blight": "వరి బాక్టీరియా ఆకుమాడు తెగులు",
  "Healthy sugarcane": "ఆరోగ్యమైన చెరకు",
  "Sugarcane mosaic": "చెరకు మొజాయిక్ వైరస్",
  "Sugarcane red rot": "చెరకు ఎర్ర కుళ్లు తెగులు",
  "Sugarcane rust": "చెరకు తుప్పు తెగులు",
  "Healthy wheat": "ఆరోగ్యమైన గోధుమ",
  "Wheat brown/leaf rust": "గోధుమ గోధుమ/ఆకు తుప్పు తెగులు",
  "Wheat yellow/stripe rust": "గోధుమ పసుపు/చారల తుప్పు తెగులు",
  "Wheat Septoria leaf disease": "గోధుమ సెప్టోరియా ఆకు తెగులు",
  "selected. SMS sent with your contact number.": "ఎంపికయ్యారు. మీ సంప్రదింపు నంబర్‌తో SMS పంపబడింది.",
  "A worker": "ఒక కార్మికుడు",
  "accepted your job.": "మీ పనిని అంగీకరించారు.",
  "Mobile Number": "మొబైల్ నంబర్",
  "Enter a valid 10-digit Indian mobile number":
    "చెల్లుబాటు అయ్యే 10 అంకెల భారతీయ మొబైల్ నంబర్ నమోదు చేయండి",
  "Farmer Login": "రైతు లాగిన్",
  "Worker Login": "కార్మికుల లాగిన్",
  "Manage your farm and find workers": "మీ పొలాన్ని నిర్వహించి కార్మికులను కనుగొనండి",
  "Find agricultural jobs near you": "మీ దగ్గరలోని వ్యవసాయ పనులను కనుగొనండి",
  "Enter mobile number": "మొబైల్ నంబర్ నమోదు చేయండి",
  Login: "లాగిన్",
  "Enter your 10-digit mobile number to continue. No OTP is required.":
    "కొనసాగించడానికి 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి. OTP అవసరం లేదు.",
  "Worker Profile": "కార్మికుల ప్రొఫైల్",
  "My Profile": "నా ప్రొఫైల్",
  "Create your worker profile before applying for jobs.":
    "పనులకు దరఖాస్తు చేయడానికి ముందుగా మీ కార్మికుడి ప్రొఫైల్‌ను నమోదు చేయండి.",
  "Worker profile loaded.": "కార్మికుడి ప్రొఫైల్ లోడ్ అయింది.",
  "Loading worker profile...": "కార్మికుడి ప్రొఫైల్‌ను లోడ్ చేస్తోంది...",
  "Could not load worker profile.": "కార్మికుడి ప్రొఫైల్‌ను లోడ్ చేయలేకపోయాం.",
  "Enter your details to find nearby agricultural jobs.":
    "దగ్గరలోని వ్యవసాయ పనులను కనుగొనడానికి మీ వివరాలను నమోదు చేయండి.",
  "Full Name": "పూర్తి పేరు",
  "Enter your name": "మీ పేరు నమోదు చేయండి",
  Village: "గ్రామం",
  "Enter your village": "మీ గ్రామం నమోదు చేయండి",
  "Skills (comma separated)": "నైపుణ్యాలు (కామాలతో వేరు చేయండి)",
  "Harvesting, Sowing, Tractor Driving": "పంట కోత, విత్తనాలు వేయడం, ట్రాక్టర్ నడపడం",
  "Experience (years)": "అనుభవం (సంవత్సరాలు)",
  "Enter experience": "అనుభవం నమోదు చేయండి",
  "Expected Daily Wage (₹)": "ఆశించే రోజువారీ కూలి (₹)",
  "Enter expected wage": "ఆశించే కూలి నమోదు చేయండి",
  "📍 Capture My Location": "📍 నా ప్రదేశాన్ని గుర్తించండి",
  "Saving...": "సేవ్ చేస్తోంది...",
  "Save Worker Profile": "కార్మికుల ప్రొఫైల్‌ను సేవ్ చేయండి",
  "Your browser does not support GPS.": "మీ బ్రౌజర్ GPSకు మద్దతు ఇవ్వదు.",
  "Location captured successfully.": "ప్రదేశం విజయవంతంగా గుర్తించబడింది.",
  "Please allow location access.": "దయచేసి ప్రదేశ అనుమతిని ఇవ్వండి.",
  "Please login first.": "దయచేసి ముందుగా లాగిన్ అవ్వండి.",
  "Please capture your location before submitting.":
    "సమర్పించే ముందు మీ ప్రదేశాన్ని గుర్తించండి.",
  "Worker profile saved successfully!": "కార్మికుల ప్రొఫైల్ విజయవంతంగా సేవ్ అయింది!",
  "Could not save profile.": "ప్రొఫైల్‌ను సేవ్ చేయలేకపోయాం.",
  "Unknown error occurred. Check browser console.":
    "తెలియని సమస్య ఎదురైంది. బ్రౌజర్ కన్సోల్‌ను పరిశీలించండి.",
  "Tracking field proximity...": "చుట్టుపక్కల పనులను వెతుకుతోంది...",
  "⚠️ Using cached local grid logs due to device hardware constraint.":
    "⚠️ పరికర పరిమితి కారణంగా సేవ్ చేసిన స్థానిక పని వివరాలను చూపిస్తోంది.",
  "Call farmer": "రైతుకు కాల్ చేయండి",
  "job(s) accepted successfully.": "పనులు విజయవంతంగా అంగీకరించబడ్డాయి."
};

const translations = {
  en: {
    home: "Home",
    farmerLogin: "Farmer Login",
    workerLogin: "Worker Login",
    farmer: "Farmer",
    worker: "Worker",

    heroTitle: "Welcome to HarvestHub",
    heroSubtitle:
      "Connecting farmers and agricultural workers for a better harvest.",

    exploreWork: "Explore Agricultural Work",
    getStarted: "Get Started",

    farmerDescription:
      "Find skilled workers and manage your agricultural work easily.",

    workerDescription:
      "Find suitable agricultural jobs and connect with farmers.",

    farmerLoginTitle: "Farmer Login",
    workerLoginTitle: "Worker Login",

    phone: "Phone Number",
    password: "Password",
    login: "Login",

    enterPhone: "Enter your phone number",
    enterPassword: "Enter your password",

    noAccount: "Don't have an account?",
    register: "Register",

    selectLanguage: "Language",
    howItWorks: "How It Works",
    workCategories: "Work Categories",

    availableWork: "Available Agricultural Work",

    backHome: "Back to Home",

    loginSuccess: "Login successful",
    invalidCredentials: "Invalid phone number or password",

    footer:
      "HarvestHub - Connecting Farmers and Agricultural Workers"
  },

  te: {
    home: "హోమ్",
    farmerLogin: "రైతు లాగిన్",
    workerLogin: "కార్మికుల లాగిన్",
    farmer: "రైతు",
    worker: "కార్మికుడు",

    heroTitle: "హార్వెస్ట్‌హబ్‌కు స్వాగతం",
    heroSubtitle:
      "మెరుగైన పంట కోసం రైతులు మరియు వ్యవసాయ కార్మికులను కలుపుతుంది.",

    exploreWork: "వ్యవసాయ పనులను చూడండి",
    getStarted: "ప్రారంభించండి",

    farmerDescription:
      "నైపుణ్యం కలిగిన కార్మికులను కనుగొని వ్యవసాయ పనులను సులభంగా నిర్వహించండి.",

    workerDescription:
      "సరైన వ్యవసాయ పనులను కనుగొని రైతులతో కనెక్ట్ అవ్వండి.",

    farmerLoginTitle: "రైతు లాగిన్",
    workerLoginTitle: "కార్మికుల లాగిన్",

    phone: "ఫోన్ నంబర్",
    password: "పాస్‌వర్డ్",
    login: "లాగిన్",

    enterPhone: "మీ ఫోన్ నంబర్ నమోదు చేయండి",
    enterPassword: "మీ పాస్‌వర్డ్ నమోదు చేయండి",

    noAccount: "ఖాతా లేదా?",
    register: "రిజిస్టర్",

    selectLanguage: "భాష",
    howItWorks: "ఎలా పనిచేస్తుంది",
    workCategories: "పని విభాగాలు",

    availableWork: "అందుబాటులో ఉన్న వ్యవసాయ పనులు",

    backHome: "హోమ్‌కు తిరిగి వెళ్ళండి",

    loginSuccess: "లాగిన్ విజయవంతమైంది",
    invalidCredentials: "ఫోన్ నంబర్ లేదా పాస్‌వర్డ్ తప్పు",

    footer:
      "హార్వెస్ట్‌హబ్ - రైతులు మరియు వ్యవసాయ కార్మికులను కలుపుతుంది"
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("harvesthub_language") || "en";
  });

  useEffect(() => {
    localStorage.setItem("harvesthub_language", language);
    document.documentElement.lang = language === "te" ? "te" : "en";
  }, [language]);

  const changeLanguage = useCallback((newLanguage) => {
    setLanguage(newLanguage);
  }, []);

  const translate = useCallback((text) => {
    return language === "te" ? contentTranslations[text] || text : text;
  }, [language]);

  const t = useCallback((key) => {
    return translations[language]?.[key] || key;
  }, [language]);

  const value = useMemo(
    () => ({ language, changeLanguage, t, translate }),
    [language, changeLanguage, t, translate]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  return useContext(LanguageContext);
};