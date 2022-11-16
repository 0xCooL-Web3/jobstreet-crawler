const puppeteer = require('puppeteer');

class JobstreetScanner{
	constructor({ keyword="", min_salary=0, max_salary=2147483647 }){
		this.options = {
			keyword: keyword, 
			min_salary: min_salary, 
			max_salary: max_salary
		}
	}

    async fetchData(){
		const browser = await puppeteer.launch({ 
			headless: false, 
            timeout: 0, 
			defaultViewport: {
				width: 1920, 
				height: 1080
			}
		});
		const page = await browser.newPage();
		const search_url = "https://www.jobstreet.com.my/en/job-search/job-vacancy.php";
		const search_selector = `#searchKeywordsField`;

		//	goto jobstreet - job search page and input keyword
		await page.goto(search_url);
		await page.waitForSelector(search_selector);
		await page.type(search_selector, this.options.keyword);
		await page.keyboard.press("Enter");

		//	get url with after input keyword and filter condition 
		const keyword_url = await page.evaluate(() => document.location.href);
        const [base_url, parameters] = keyword_url.split("?");
        //  selector of page_list and job_list
        const page_list_selector = `#pagination > option:last-child`;
	    const job_list_selector = `article`;

        // get max of the page
        await page.waitForSelector(page_list_selector);
        const page_max = await page.evaluate(page_list_selector => {
            return parseInt(document.querySelector(page_list_selector).textContent) || 1;
        }, page_list_selector);


        let job_list = [];
        //  loop the job list page
        // for(let page_idx=1; page_idx<=page_max; page_idx++){
        for(let page_idx=1; page_idx<=1; page_idx++){
            let url = (this.options.keyword === "")?
                base_url: 
                `${base_url}${page_idx}/?${parameters}`;

            await page.goto(url);
            await page.waitForSelector(job_list_selector);

            let json = await page.evaluate(job_list_selector => {
                return [...document.querySelectorAll(job_list_selector)].map(ele => {
                    //  convert salary range to [currency, salary min, salary max]
                    //	(ex:  MYR 15K - 25K monthly → ["MYR", 15000, 25000])
                    const getSalary = (salary_str) => {
                        let [salary_left, salary_right] = [salary_str.split(" - ")[0], salary_str.split(" - ")[1] || ""];
                        //	html entity symbol (&nbsp;), ASCII code to string
                        let space = String.fromCharCode(160);
                        //  if not empty, get the currency value
                        let currency = (salary_left)? salary_left.split(space)[0]: "";
                        let [salary_min, salary_max] = [0, 0];
                
                        //  convert salary_min str to int
                        if(salary_left){
                            let str_min = salary_left.toLowerCase().split(space)[1];
                            let is_include_k = str_min.includes('k');
                
                            salary_min = ~~str_min.replace(/k/gi, "");
                            if(is_include_k)
                                salary_min *= 1000;
                        }
                        //  convert salary_max str to int
                        if(salary_left){
                            let str_max = salary_right.toLowerCase().split(' ')[0];
                            let is_include_k = str_max.includes('k');
                
                            salary_max = ~~str_max.replace(/k/gi, "");
                            if(is_include_k)
                                salary_max *= 1000;
                        }
                
                        return [currency, salary_min, salary_max];
                    }
                    
                    /**
                     * from job element fetch <li> text
                     * 
                     * @param {html element} root 
                     * @returns {array[string]} 
                     */
                    const getHighlights = (root) => {
                        let li_eles = root.querySelectorAll(`div[data-automation="job-card-selling-points"] li`);
                        let highlights = [];

                        for(let ele of li_eles)
                            highlights.push(ele.textContent);
                        
                        return highlights
                    }

                    /**
                     * 
                     * @param {html element} root 
                     * @returns {array, string}
                     */
                    const getDetails = (root) => {
                        //  detail root element
                        let detail_ele = root.querySelector(`div > div > div`).nextElementSibling;
                        let dd_eles = detail_ele.querySelectorAll(`dd`);
                        let specializations = [];
                        let type = "";
                        //  last index of dd_eles array
                        let last = dd_eles.length - 1;

                        for(let i=0; i<dd_eles.length; i++)
                            if(i === last)
                                type = dd_eles[i].textContent;
                            else
                                specializations.push(dd_eles[i].textContent);
                        
                        return [specializations, type];
                    }
                    
                    //  get domain
                    let link = document.location.href;
                    let domain = link.substring(0, link.indexOf('/', 9));
                    //	job url and title
                    let a = ele.querySelector(`h1 > a`);
                    let url = a.getAttribute(`href`).substring(0, a.getAttribute(`href`).indexOf('&'));
                    let job_title = a.textContent;
                    //	company element and name
                    let company_ele = ele.querySelector(`a[data-automation="jobCardCompanyLink"]`);
                    let company_name = (company_ele)? company_ele.textContent: "";
                    //	place element and name
                    let place_ele = a.parentElement.parentElement.nextElementSibling;
                    let place = (place_ele)? place_ele.textContent: "";
                    //	salary element, currency, min and max
                    let salary_ele = place_ele.nextElementSibling;
                    let salary_str = (salary_ele.nodeName === "SPAN")? salary_ele.textContent: "";
                    let [currency, salary_min, salary_max] = getSalary(salary_str);
                    //  highlights (job sell points)
                    let highlights = getHighlights(ele);
                    //  specializations and type (click to get detail information)
                    ele.querySelector(`button`).click();
                    let [specializations, type] = getDetails(ele);
                    //	datetime with UTC+0
                    let datetime = ele.querySelector(`time`).getAttribute('datetime');
                    
                    return {
                        url: domain + url, 
                        job_title: job_title, 
                        company_name: company_name, 
                        place: place, 
                        salary: {
                            currency: currency, 
                            min: salary_min, 
                            max: salary_max
                        }, 
                        highlights: highlights, 
                        specializations: specializations, 
                        type: type, 
                        datetime: datetime, 
                    };		
                });
            }, job_list_selector);

            job_list.push(...json);
        }

        console.log(job_list);
		browser.close();
		return job_list;
	}
}

module.exports = JobstreetScanner;