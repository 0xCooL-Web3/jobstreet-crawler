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

        let analysis = {
            salary: salary()
        };

        return analysis;
    }
}

module.exports = JobstreetAnalysis;