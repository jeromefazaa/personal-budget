In this project suggested to me by Codecademy throughout my Back-End Engineering career path,
I will use Envelope Budgeting to build a system and an app for anyone to manage their personal finances.



How to use api: 

"Endpoint" :
 -Method:
 -Function:
 -Required Body Parameterd:
 -Remarks


 http://localhost:3000/api/envelope : 
 -POST
 -Create a new envelope
 -Params:
 concern(String) => what is the enveloped used for?
 budget (Number) => monthly budget for envelope.

 -When creating a new envelope make sure that the total budget for all envelopes including the new one do not exceed the total monthly income,
  which is set by default to 2,000. You can change it yourself, in ../envelope/income,




http://localhost:3000/api/envelope : 
 -GET
 -Get all envelopes
 -No required params


 http://localhost:3000/api/envelope/income : 
 -PUT
 -Update monthly income 
 -income(number)


 http://localhost:3000/api/envelope/income : 
 -GET
 -Get monthly income 
 -None


  http://localhost:3000/api/envelope/:id : 
 -GET
 -Get specific envelope 
 -None


  http://localhost:3000/api/envelope/:id : 
 -PUT
 -Update specific envelope 
 -Optional params (must specify at least one) :
 concern(String) => what is the enveloped used for?
 budget (Number) => monthly budget for envelope.
 spend(Number) => money spent from envelope will update remaining money in envelope

  http://localhost:3000/api/envelope/:id : 
 -DELETE
 -Delete specific envelope 
 -None








 







