package org.jumpmind.pos.service.compatibility;

import io.swagger.annotations.Api;
import org.springframework.web.bind.annotation.*;

@Api(tags = "Testing Customer Service", description = "This service exposes endpoints to retrieve customer information")
@RestController("testingCustomer")
@RequestMapping("/testingCustomer")
public interface ITestingCustomerService {

    @RequestMapping(path = "/getCustomer", method = RequestMethod.POST)
    @ResponseBody
    public TestingGetCustomerResponse getCustomer(@RequestBody String customerId);

    @RequestMapping(path = "/saveCustomer", method = RequestMethod.POST)
    @ResponseBody
    public TestingSaveCustomerResponse saveCustomer(@RequestBody TestingSaveCustomerRequest saveCustomerRequest);

    @RequestMapping(path = "/unlinkCustomer", method = RequestMethod.POST)
    @ResponseBody
    public TestingSaveCustomerResponse unlinkCustomer(@RequestBody TestingSaveCustomerRequest saveCustomerRequest);

    @RequestMapping(path = "/getLoyaltyPromotions", method = RequestMethod.POST)
    @ResponseBody
    public TestingGetLoyaltyPromotionsResponse getLoyaltyPromotions(@RequestBody String customerId);

}