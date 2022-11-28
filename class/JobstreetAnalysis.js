class JobstreetAnalysis{
    constructor(json=[], currency=''){
        // this.analysis = this.getAnalysis(json);
        this.currency = currency;
        return this.getAnalysis(json);
    }

    getAnalysis(json=[]){
        const salary = () => {
            //  filter out salary not zero
            let arr = (this.currency === '')?
                json.filter(obj => (obj.salary.min !== 0)):
                json.filter(obj => (obj.salary.min !== 0 && obj.salary.currency === this.currency));
            let min_range = new Map();
            let mid_range = new Map();
            let max_range = new Map();
            let total = {
                min: 0, 
                mid: 0, 
                max: 0
            }
            
            for(let obj of arr){
                let min = obj.salary.min;
                let max = obj.salary.max;
                let mid = min + (max - min) / 2;

                min_range.set(min, (min_range.get(min) || 0) + 1);
                mid_range.set(mid, (mid_range.get(mid) || 0) + 1);
                max_range.set(max, (max_range.get(max) || 0) + 1);

                total.min += min;
                total.mid += mid;
                total.max += max;
            }

            //  calculation average salary
            let avg = {
                min: Number((total.min / arr.length).toFixed()),
                mid: Number((total.mid / arr.length).toFixed()),
                max: Number((total.max / arr.length).toFixed()),
            }
            //  re-build range from Map to Array and sorting
            let range = {
                min: [...min_range].sort((a, b) => a[0] - b[0]),
                mid: [...mid_range].sort((a, b) => a[0] - b[0]),
                max: [...max_range].sort((a, b) => a[0] - b[0]),
            }

            //  build return result object
            let result = {
                public: arr.length, 
                private: json.length - arr.length,
                salary_avg: avg, 
                salary_range: range
            }

            return result;
        }

        /**
         *  @param {string} career_level
         *  @param {array} qualification
         *  @param {int} experience
         */
        const jobAdditional = () => {
            //  use map to count unique value appear time
            let map_lv = new Map();
            let map_qualification = new Map();
            let map_exp = new Map();
            //  career_level with mix with experience to store
            let map_lv_exp = new Map();
            
            for(let obj of json){
                let add = obj.additional;
                let lv_exp = `${add.career_level}_${add.experience}`;
                
                map_lv.set(add.career_level, (map_lv.get(add.career_level) || 0) + 1);
                map_exp.set(add.experience, (map_exp.get(add.experience) || 0) + 1);
                for(let str of add.qualification)
                    map_qualification.set(str, (map_qualification.get(str) || 0) + 1);
                map_lv_exp.set(lv_exp, (map_lv_exp.get(lv_exp) || 0) + 1);
            }
            
            //  build return result object
            let result = {
                career_level: [...map_lv], 
                qualification: [...map_qualification], 
                experience: [...map_exp], 
            }

            console.log(result);
            return result;
        }

        let analysis = {
            salary: salary(), 
            job_additional: jobAdditional()
        };

        return analysis;
    }
}

module.exports = JobstreetAnalysis;