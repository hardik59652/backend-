class apiResponse{
    constructor(statusCode,data,message="sucess"){
        this.statusCode=statusCode
        this.data=data
        this.message=message
        this.succes=statusCode<400 

    }
}
export {apiResponse}