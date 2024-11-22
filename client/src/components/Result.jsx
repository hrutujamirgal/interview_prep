import { Button } from "antd"
import { useCookies } from "react-cookie";
import { useComponent } from "../context/ComponentContext";

const Result = ()=>{
    const [cookies] = useCookies('mocktopic')
    const {download_mock_component_report}= useComponent()

    const handleDownloadReport = async () => {
        const topic = cookies.mocktopic

            switch (topic) {
              case "mcq":
                await download_mock_component_report('mcq');
                break;
              case "coding":
                await download_mock_component_report('coding');
                break;
              default:
                throw new Error("Invalid report type.");
            }
            
          
      };

   return(<>
      <p className="m-10 font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-center">Sorry, But you are not Qualified for the next Phase</p>

      <p className=" mt-20 font-serif text-lg md:text-xl lg:text-2xl font-bold text-center">Download the Result for the previous test: </p>
      <div className="flex justify-center">
      <Button
                className="p-5 text-xl bg-main text-white "
                onClick={handleDownloadReport}
              >
                Download Report
              </Button>
      </div>
   </>)
}


export default Result