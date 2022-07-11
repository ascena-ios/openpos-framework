package org.jumpmind.pos.core.model;

public final class FieldPattern {
    public static final String EMAIL =  "^(?:[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*|(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*)@(?:(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\\.)+[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[A-Za-z0-9-]*[A-Za-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])";
    public static final String NAME =  "^([A-Za-zÀ-ÖØ-öø-ÿ' \\.-])+"; //Allow '.- and accented letters in name fields
    public static final String MONEY =  "^(\\d{0,9}\\.\\d{0,2}|\\d{1,9})$";
    public static final String PERCENT =  "^100$|^\\d{0,2}(\\.\\d{1,2})?$|^\\d{0,2}(\\.)?"; // 100-0, Only two decimal places allowed.
    public static final String DATE = "^(\\d{2})/(\\d{2})/(\\d{4}$)";
    public static final String YY_DATE = "^(\\d{2})/(\\d{2})/(\\d{2}$)";
    public static final String NO_YEAR_DATE = "^(\\d{2})/(\\d{2})$";
    public static final String US_PHONE_NUMBER = "^\\d{10}$";
    public static final String WORD_CHARS = "^[a-zA-Z0-9]+$";

}
