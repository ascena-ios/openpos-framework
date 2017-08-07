package org.jumpmind.jumppos.pos.screen;

import java.util.ArrayList;
import java.util.List;

import org.jumpmind.jumppos.core.screen.PromptScreen;

public class SellItemScreen extends PromptScreen {

    private List<LineItem> items = new ArrayList<>();
    
    String balanceDue;
    String discountTotal;
    String grandTotal;
    String subTotal;
    String taxTotal;   
    
    public SellItemScreen() {
        this.setType(SELL_SCREEN_TYPE);
    }
  
    public List<LineItem> getItems() {
        return items;
    }

    public void setItems(List<LineItem> items) {
        this.items = items;
    }

    public String getBalanceDue() {
        return balanceDue;
    }

    public void setBalanceDue(String balanceDue) {
        this.balanceDue = balanceDue;
    }

    public String getDiscountTotal() {
        return discountTotal;
    }

    public void setDiscountTotal(String discountTotal) {
        this.discountTotal = discountTotal;
    }

    public String getGrandTotal() {
        return grandTotal;
    }

    public void setGrandTotal(String grandTotal) {
        this.grandTotal = grandTotal;
    }

    public String getSubTotal() {
        return subTotal;
    }

    public void setSubTotal(String subTotal) {
        this.subTotal = subTotal;
    }

    public String getTaxTotal() {
        return taxTotal;
    }

    public void setTaxTotal(String taxTotal) {
        this.taxTotal = taxTotal;
    }
    
    

}
