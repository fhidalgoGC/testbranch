import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useLocation } from "wouter";
import {
  useCreateSubContractState,
  usePageTracking,
  useNavigationHandler,
} from "@/hooks/usePageState";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSelector } from "react-redux";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Calendar,
  Package,
  DollarSign,
  FileText,
  X,
  ArrowRight,
} from "lucide-react";
import { Link } from "wouter";
import { FormattedNumberInput } from "@/components/PurchaseContractForm/components/FormattedNumberInput";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { DatePicker } from "@/components/ui/datepicker";
import { formatNumber } from "@/lib/numberFormatter";
import { NUMBER_FORMAT_CONFIG } from "@/environment/environment";
import { authenticatedFetch } from "@/utils/apiInterceptors";
import { QuantityActualOverview } from "@/components/contracts/QuantityActualOverview";

// Sub-contract form validation schema with business rules
const createSubContractValidationSchema = (openInventory: number = 0) =>
  z.object({
    // Form display fields
    contractNumber: z.string().min(1, "Contract number is required"),
    contractDate: z.string().min(1, "Contract date is required"),
    customerNumber: z.string().min(1, "Customer number is required"),
    idContract: z.string().min(1, "ID Contract is required"),
    referenceNumber: z.string().min(1, "Reference number is required"),
    commodity: z.string().min(1, "Commodity is required"),
    contact: z.string().optional(),
    shipmentPeriod: z.string().optional(),

    // API fields with business validation
    future: z.number().optional(), // Future is not required
    basis: z.number(),
    totalPrice: z.number().min(0, "Total price must be positive"),
    totalDate: z.string().min(1, "Date is required"), // Required field
    quantity: z
      .number()
      .min(0.01, "Quantity must be greater than 0") // Cannot be negative or zero
      .max(
        openInventory,
        `Quantity cannot exceed available inventory (${openInventory})`,
      ), // Cannot exceed open inventory
    measurementUnitId: z.string().min(1, "Measurement unit is required"), // Required field
  });

// Create a base schema for type inference
const baseSubContractSchema = z.object({
  contractNumber: z.string(),
  contractDate: z.string(),
  customerNumber: z.string(),
  idContract: z.string(),
  referenceNumber: z.string(),
  commodity: z.string(),
  contact: z.string().optional(),
  shipmentPeriod: z.string().optional(),
  future: z.number().optional(),
  basis: z.number(),
  totalPrice: z.number(),
  totalDate: z.string(),
  quantity: z.number(),
  measurementUnitId: z.string(),
});

type SubContractFormData = z.infer<typeof baseSubContractSchema>;

interface ContractData {
  contractNumber: string; // Ya no se usa, mantener por compatibilidad
  contractDate: string;
  customerNumber: string; // Ahora representa buyer para sale contracts
  idContract: string; // Ahora es el folio
  referenceNumber: string;
  commodity: string;
  quantityUnits: number;
  price: number;
  basis: number;
  future: number;
  contact: string;
  shipmentPeriod: string;
}

export default function CreateSaleSubContract() {
  const { t } = useTranslation();
  const params = useParams();
  const [location, setLocation] = useLocation();

  const contractId = params.contractId;

  const { createSubContractState, updateState } = useCreateSubContractState(
    contractId!,
  );
  const { handleNavigateToPage } = useNavigationHandler();

  // Obtener contratos del state de Redux para sale contracts
  const contractsState = useSelector(
    (state: any) => state.pageState.saleContracts,
  );
  const contractsData = contractsState.contractsData || [];

  usePageTracking(`/sale-contracts/${contractId}/sub-contracts/create`);

  // Notificar navegación al cargar la página
  useEffect(() => {
    handleNavigateToPage("createSubContract", contractId);
  }, [contractId]);

  // State management
  const [contractData, setContractData] = useState<ContractData>({
    contractNumber: "",
    contractDate: "",
    customerNumber: "",
    idContract: "",
    referenceNumber: "",
    commodity: "",
    quantityUnits: 0,
    price: 0,
    basis: 0,
    future: 0,
    contact: "",
    shipmentPeriod: "",
  });

  const [openInventory, setOpenInventory] = useState<number>(0);
  const [totalPriceCalc, setTotalPriceCalc] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Get measurement units
  const {
    data: measurementUnits = [],
    isLoading: loadingUnits,
    error: unitsError,
  } = useMeasurementUnits();
  
  // Debug measurement units API call
  useEffect(() => {
    console.log('🔍 Measurement Units Debug in CreateSaleSubContract:');
    console.log('- Loading:', loadingUnits);
    console.log('- Error:', unitsError);
    console.log('- Data:', measurementUnits);
    console.log('- Count:', measurementUnits.length);
  }, [measurementUnits, loadingUnits, unitsError]);

  // Create form with validation schema
  const validationSchema = createSubContractValidationSchema(openInventory);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
    reset,
  } = useForm<SubContractFormData>({
    resolver: zodResolver(validationSchema),
    mode: "onChange",
    defaultValues: createSubContractState.formData || {
      contractNumber: "",
      contractDate: "",
      customerNumber: "",
      idContract: "",
      referenceNumber: "",
      commodity: "",
      contact: "",
      shipmentPeriod: "",
      future: 0,
      basis: 0,
      totalPrice: 0,
      totalDate: new Date().toISOString().split("T")[0],
      quantity: 0,
      measurementUnitId: "",
    },
  });

  // Watch values for calculations
  const watchedValues = watch(["future", "basis", "quantity"]);

  // Load contract data from Redux state or API
  useEffect(() => {
    const loadContractData = async () => {
      if (!contractId) return;

      console.log("🔄 Loading contract data for contract ID:", contractId);

      try {
        // First try to find in Redux state
        const foundContract = contractsData.find(
          (contract: any) =>
            contract._id === contractId || contract.id === contractId,
        );

        console.log("🔍 Found contract in Redux:", foundContract);

        if (foundContract) {
          // Get buyer for sale contracts
          const buyer = foundContract.participants?.find(
            (p: any) => p.role === "buyer",
          );
          const seller = foundContract.participants?.find(
            (p: any) => p.role === "seller",
          );

          const contractInfo: ContractData = {
            contractNumber: foundContract.folio || "",
            contractDate: foundContract.contract_date
              ? new Date(foundContract.contract_date)
                  .toISOString()
                  .split("T")[0]
              : "",
            customerNumber: buyer?.name || "Unknown Buyer",
            idContract: foundContract.folio || "",
            referenceNumber:
              foundContract.reference_number || foundContract.folio || "",
            commodity: foundContract.commodity?.name || "",
            quantityUnits: foundContract.quantity || 0,
            price: foundContract.price_schedule?.[0]?.price || 0,
            basis: foundContract.price_schedule?.[0]?.basis || 0,
            future: foundContract.price_schedule?.[0]?.future_price || 0,
            contact: seller?.name || "",
            shipmentPeriod:
              foundContract.shipping_start_date &&
              foundContract.shipping_end_date
                ? `${new Date(foundContract.shipping_start_date).toLocaleDateString()} - ${new Date(foundContract.shipping_end_date).toLocaleDateString()}`
                : "",
          };

          setContractData(contractInfo);

          // Set open inventory
          const openInventoryValue =
            foundContract.inventory?.open || foundContract.quantity || 0;
          setOpenInventory(openInventoryValue);

          // Update form values
          setValue("contractNumber", contractInfo.contractNumber);
          setValue("contractDate", contractInfo.contractDate);
          setValue("customerNumber", contractInfo.customerNumber);
          setValue("idContract", contractInfo.idContract);
          setValue("referenceNumber", contractInfo.referenceNumber);
          setValue("commodity", contractInfo.commodity);
          setValue("contact", contractInfo.contact);
          setValue("shipmentPeriod", contractInfo.shipmentPeriod);
          setValue("future", contractInfo.future);
          setValue("basis", contractInfo.basis);

          console.log("✅ Contract data loaded successfully:", contractInfo);
        } else {
          console.warn("❌ Contract not found in Redux state");
          setError("Contract not found");
        }
      } catch (err) {
        console.error("❌ Error loading contract data:", err);
        setError("Failed to load contract data");
      }
    };

    loadContractData();
  }, [contractId, contractsData, setValue]);

  // Calculate total price when future, basis, or quantity changes
  useEffect(() => {
    const [future = 0, basis = 0, quantity = 0] = watchedValues;

    // For sale contracts: total price = (future + basis) × quantity
    const calculatedPrice = (future + basis) * quantity;
    setTotalPriceCalc(calculatedPrice);
    setValue("totalPrice", calculatedPrice);

    console.log("💰 Price calculation:", {
      future,
      basis,
      quantity,
      calculatedPrice,
    });
  }, [watchedValues, setValue]);

  // Persist form data to Redux
  useEffect(() => {
    const subscription = watch((data) => {
      updateState({ formData: data as any });
    });
    return () => subscription.unsubscribe();
  }, [watch, updateState]);

  const onSubmit = async (data: SubContractFormData) => {
    console.log("📝 Form submitted with data:", data);
    setShowConfirmDialog(true);
  };

  const confirmSubmit = async () => {
    if (!contractId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = watch();

      console.log("🚀 Submitting sub-contract creation request...");

      // Find the selected measurement unit to get both slug and ObjectId
      console.log("que hay aqui", measurementUnits);
      const selectedUnit = measurementUnits.find(
        (unit) => unit.value === formData.measurementUnitId,
      );

      // Prepare API payload for sale sub-contract
      const apiPayload = {
        parent_contract_id: contractId,
        quantity: formData.quantity,
        measurement_unit: selectedUnit?.value || formData.measurementUnitId, // Send slug (like "bu60")
        measurement_unit_id: selectedUnit?.key || "", // Send ObjectId
        future_price: formData.future || 0,
        basis: formData.basis,
        price: totalPriceCalc, // Calculated total price
        delivery_date: formData.totalDate,
        type: "sale", // Specify this is a sale sub-contract
      };

      console.log("📤 API Payload:", apiPayload);

      const response = await authenticatedFetch("/api/v1/subcontracts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorData}`);
      }

      const responseData = await response.json();
      console.log("✅ Sub-contract created successfully:", responseData);

      // Clear form state
      updateState({ formData: {} });

      // Navigate back to sale contract detail with refresh
      setLocation(`/sale-contracts/${contractId}?refresh=true`);
    } catch (err) {
      console.error("❌ Error creating sub-contract:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create sub-contract",
      );
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  const handleCancel = () => {
    // Clear form state
    updateState({ formData: {} });
    // Navigate back
    setLocation(`/sale-contracts/${contractId}`);
  };

  if (loadingUnits) {
    return (
      <DashboardLayout title={t("createSaleSubContract")}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (unitsError) {
    return (
      <DashboardLayout title={t("createSaleSubContract")}>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <X className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t("error")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {unitsError
              ? String(unitsError)
              : "Failed to load measurement units"}
          </p>
          <Button onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("back")}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t("createSaleSubContract")}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("back")}
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t("createSaleSubContract")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t("fillSubContractDetails")}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <X className="h-5 w-5 text-red-500" />
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quantity Overview */}
        <QuantityActualOverview
          mode="view"
          parentQuantity={contractData.quantityUnits}
          parentContractData={{ inventory: { open: openInventory } }}
          contractData={{ commodity: contractData.commodity }}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Contract Information (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t("contractInformation")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("contractDate")}
                  </label>
                  <Controller
                    name="contractDate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="date"
                        disabled
                        className="bg-gray-50 dark:bg-gray-800"
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("buyer")}{" "}
                    {/* Changed from seller to buyer for sale contracts */}
                  </label>
                  <Controller
                    name="customerNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        disabled
                        className="bg-gray-50 dark:bg-gray-800"
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("contractNumber")}
                  </label>
                  <Controller
                    name="idContract"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        disabled
                        className="bg-gray-50 dark:bg-gray-800"
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("commodity")}
                  </label>
                  <Controller
                    name="commodity"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        disabled
                        className="bg-gray-50 dark:bg-gray-800"
                      />
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quantity and Measurement Unit */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {t("quantityInformation")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("quantity")} <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="quantity"
                    control={control}
                    render={({ field }) => (
                      <FormattedNumberInput
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          trigger("quantity");
                        }}
                        placeholder={t("enterQuantity")}
                        error={!!errors.quantity}
                      />
                    )}
                  />
                  {errors.quantity && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.quantity.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("measurementUnit")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="measurementUnitId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          className={
                            errors.measurementUnitId ? "border-red-500" : ""
                          }
                        >
                          <SelectValue
                            placeholder={t("selectMeasurementUnit")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {measurementUnits.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.measurementUnitId && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.measurementUnitId.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {t("priceInformation")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("future")}
                  </label>
                  <Controller
                    name="future"
                    control={control}
                    render={({ field }) => (
                      <FormattedNumberInput
                        value={field.value || 0}
                        onChange={field.onChange}
                        placeholder={t("enterFuture")}
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("basis")} <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="basis"
                    control={control}
                    render={({ field }) => (
                      <FormattedNumberInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t("enterBasis")}
                        error={!!errors.basis}
                      />
                    )}
                  />
                  {errors.basis && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.basis.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("totalPrice")}
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                      $
                      {formatNumber({
                        value: totalPriceCalc,
                        minDecimals: 2,
                        maxDecimals: 2,
                        formatPattern: "0,000.00",
                        roundMode: "truncate",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t("deliveryInformation")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("deliveryDate")} <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="totalDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t("selectDeliveryDate")}
                        error={!!errors.totalDate}
                      />
                    )}
                  />
                  {errors.totalDate && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.totalDate.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? (
                <>
                  <ArrowRight className="h-4 w-4 mr-2 animate-spin" />
                  {t("creating")}
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  {t("createSubContract")}
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("confirmCreateSubContract")}</DialogTitle>
              <DialogDescription>
                {t("confirmCreateSubContractDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("quantity")}:
                  </span>
                  <span className="font-medium">
                    {watch("quantity")}{" "}
                    {measurementUnits.find(
                      (u) => u.value === watch("measurementUnitId"),
                    )?.label || ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("totalPrice")}:
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    $
                    {formatNumber({
                      value: totalPriceCalc,
                      minDecimals: 2,
                      maxDecimals: 2,
                      formatPattern: "0,000.00",
                      roundMode: "truncate",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("deliveryDate")}:
                  </span>
                  <span className="font-medium">
                    {new Date(watch("totalDate")).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
              >
                {t("cancel")}
              </Button>
              <Button onClick={confirmSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2 animate-spin" />
                    {t("creating")}
                  </>
                ) : (
                  t("confirm")
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
