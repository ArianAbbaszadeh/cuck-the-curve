import React, {useCallback, useEffect, useState} from "react";
import { Chart as ChartJS, BarElement, Tooltip, Legend, CategoryScale, LinearScale} from "chart.js";
import { Bar } from "react-chartjs-2";
import { apiToken } from "./token";
import "./info.css";

//register BarChart ELements
ChartJS.register(
	BarElement,
	Tooltip,
	Legend,
	CategoryScale,
	LinearScale,
  )

function CourseInfo({courseInfo, setMadgrades, madgrades}){
	const [loading, setLoading] = useState(false);
	const [offering, setOffering] = useState(null);
	//get course grade distribution information
	const fetchGradeInfo = useCallback(async (url) => {
		setOffering(null)
		try{			
		  console.log("url", url);
		  setLoading(true);
		  const response = await fetch(url, {
			method: 'GET',
			headers: {
			  'Authorization': 'Token token=' + apiToken,
			  'Accept': 'application/json'
			}
		  })
		  
		  if(!response.ok){
			console.log("url", url);
			return null;
		  }
		  
		  const json = await response.json();
		  try{
			const response2 = await fetch(json.gradesUrl, {
				method: 'GET',
				headers: {
				'Authorization': 'Token token=' + apiToken,
				'Accept': 'application/json'
				}
			});
			if (!response.ok){
				return null
			}

			const grade_json = await response2.json();
			setLoading(false)
			setMadgrades(grade_json)
		  } catch(error){
			console.error(error.message);
		  }
		  
		} catch(error) {
		  console.error(error.message);
		}
	  });

	useEffect(() => {
		if(courseInfo == null){
			return;
		}
		const baseURL = 'https://api.madgrades.com/v1/courses';
		const url = baseURL + "/" + courseInfo.id;

		fetchGradeInfo(url);
	
	}, [courseInfo]);

	let total = 1;
	let labels = [];
	let values = [];

	if(madgrades != null){
	   	total = madgrades.cumulative.total;
		const gradeData = Object.fromEntries(
		   Object.entries(madgrades.cumulative).filter(([key]) => !['total', 'crCount', 'iCount', 'nCount', 'nwCount', 'pCount', 'sCount', 'uCount', 'nrCount'].includes(key)));
		const cleaned = Object.fromEntries(Object.entries(gradeData).map(([key, value]) => [key.slice(0, -5).toUpperCase(), value]));
	   	const sorted = Object.fromEntries(Object.entries(cleaned).sort((a,b) => a[0].localeCompare(b[0])));
			
	   	labels = Object.keys(sorted);
	   	values = Object.values(sorted);
	}

	const data={
		labels: labels,
		datasets:[{
			label: ["Cumulative Course Data"],
			data: values.map(value => 100*(value/total)),
		},],
	}
	let offering_total = 1;
	let values2 = [];
	if (offering != null && madgrades != null){
		const offering_total = offering.cumulative.total;
		const gradeData = Object.fromEntries(
			Object.entries(offering.cumulative).filter(([key]) => !['total', 'crCount', 'iCount', 'nCount', 'nwCount', 'pCount', 'sCount', 'uCount', 'nrCount'].includes(key)));
		const cleaned = Object.fromEntries(Object.entries(gradeData).map(([key, value]) => [key.slice(0, -5).toUpperCase(), value]));
		const sorted = Object.fromEntries(Object.entries(cleaned).sort((a,b) => a[0].localeCompare(b[0])));

		values2 = Object.values(sorted)
		data.datasets.push({label:["Course Offering Data"], data: values2.map(value => 100 * (value/offering_total))});
	}

	if(madgrades == null || courseInfo == null){
		return <></>
	}
	return(
		<div className="info">
			
				
				<div>
					<h2>Grade Distribution: </h2>
					{loading ? <div className="">Loading...</div> :
					<div className="graph-container">
						<div className="course-offering">
						{
							madgrades.courseOfferings.map((courseOffer) => (courseOffer.sections.map((section) => (
										<div className="course-box " onClick={() => (setOffering(courseOffer))}>
											<div>
											{
												(courseOffer.termCode - Math.floor((courseOffer.termCode/10))*10) == 2 ? "Fall " :
												(courseOffer.termCode - Math.floor((courseOffer.termCode/10))*10) == 4 ? "Spring " : 
												(courseOffer.termCode - Math.floor((courseOffer.termCode/10))*10) == 6 ? "Summer ":
												Math.floor((courseOffer.termCode/10))*10} 
												{1900+ Math.floor(courseOffer.termCode/10)}
											</div>
											{section.instructors.map((instructor) => <>{instructor.name}</>)}
										</div>
							))))
						}	
						</div>
						<div className="graph">
							<Bar data={data}/>
						</div>
					</div>

					}
				</div>
			<div>
				<h2>Description: </h2>{courseInfo == null ? "" : courseInfo.description}
			</div>
		</div>
	);
}

export default CourseInfo;