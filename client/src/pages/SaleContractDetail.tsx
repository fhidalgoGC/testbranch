import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useLocation } from "wouter";
import {
  useContractDetailState,
  usePageTracking,
  useNavigationHandler,
} from "@/hooks/usePageState";
import { useSelector, useDispatch } from "react-redux";
import {
  updateCreateSubContractState,
  updateEditSubContractState,
} from "@/store/slices/pageStateSlice";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  Printer,
  Plus,
  Check,
  RefreshCw,
  Loader2,
  X,
  Lock,
} from "lucide-react";
import { Link } from "wouter";
import { PurchaseContract } from "@/types/purchaseSaleContract.types";
import { formatNumber } from "@/lib/numberFormatter";
import { environment } from "@/environment";
import SubContractsSection from "@/components/contracts/SubContractsSection";
import {
  SubContract,
  FieldConfig,
  ProgressBarConfig,
} from "@/components/contracts/SubContractCard";
import { authenticatedFetch, hasAuthTokens } from "@/utils/apiInterceptors";
import { 
  deleteSubContract, 
  getContractById, 
  getSubContractsByContractId, 
  getParticipantLocation, 
  deleteContract, 
  settleParentContract, 
  settleSubContract 
} from "@/services/contractsService";

export default function SaleContractDetail() {
  const { t } = useTranslation();
  const params = useParams();
  const [location, setLocation] = useLocation();

  const contractId = params.id;

  // Hook para persistir estado del detalle de contrato
  const { contractState, updateState } = useContractDetailState(contractId!);
  const { handleNavigateToPage } = useNavigationHandler();

  // Obtener contratos del state de Redux
  const contractsState = useSelector(
    (state: any) => state.pageState.saleContracts,
  );
  const contractsData = contractsState.contractsData || [];

  // Get dispatch function for updating Redux state
  const dispatch = useDispatch();

  usePageTracking(`/sale-contracts/${contractId}`);

  // Notificar navegación al cargar la página
  useEffect(() => {
    handleNavigateToPage("contractDetail", contractId);
  }, [contractId]);

  // Detectar parámetro refresh en URL y disparar actualización completa
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shouldRefresh = urlParams.get("refresh") === "true";

    if (shouldRefresh && contractId) {
      console.log("🔄 Refresh parameter detected, triggering full refresh");
      // Limpiar el parámetro de la URL
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);

      // Disparar refresh después de un breve delay para asegurar que el componente esté montado
      setTimeout(() => {
        handleFullRefresh();
      }, 100);
    }
  }, [location, contractId]);

  // Estados
  const [contract, setContract] = useState<PurchaseContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(
    contractState.activeTab || "general",
  );

  // Estado para el contrato específico encontrado
  const [currentContractData, setCurrentContractData] = useState<any>(null);

  // Estado para la dirección del participante
  const [participantAddress, setParticipantAddress] = useState<{
    [key: string]: any;
  }>({});

  // Estados para sub-contratos
  const [subContracts, setSubContracts] = useState<SubContract[]>([]);
  const [subContractsLoading, setSubContractsLoading] = useState(false);

  // Estados para diálogos
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<string | null>(null);
  const [deleteSubDialogOpen, setDeleteSubDialogOpen] = useState(false);
  const [subContractToDelete, setSubContractToDelete] = useState<string | null>(
    null,
  );

  // Estados para settlement
  const [settleDialogOpen, setSettleDialogOpen] = useState(false);
  const [settleSubDialogOpen, setSettleSubDialogOpen] = useState(false);
  const [contractToSettle, setContractToSettle] = useState<string | null>(null);
  const [subContractToSettle, setSubContractToSettle] = useState<string | null>(
    null,
  );
  const [isSettling, setIsSettling] = useState(false);

  // Estados de operaciones
  const [operationLoading, setOperationLoading] = useState(false);

  // Función para cargar datos del contrato
  const loadContractData = async () => {
    if (!contractId) return;

    try {
      setLoading(true);
      setError(null);

      console.log("📥 LOADING CONTRACT DATA:", contractId);

      // Usar el servicio centralizado para obtener el contrato
      const contractData = await getContractById(contractId);
      
      if (contractData) {
        setContract(contractData);
        setCurrentContractData(contractData);
        console.log("✅ Contract data loaded successfully:", contractData);

        // Cargar ubicación del participante seller (para sale contracts)
        const seller = contractData.participants?.find(p => p.role === "seller");
        if (seller?.people_id) {
          try {
            const locationData = await getParticipantLocation(seller.people_id);
            if (locationData) {
              setParticipantAddress(prev => ({
                ...prev,
                [seller.people_id]: locationData
              }));
            }
          } catch (error) {
            console.warn("Could not load seller location:", error);
          }
        }
      } else {
        setError("Contract not found");
      }
    } catch (error) {
      console.error("Error loading contract:", error);
      setError(error instanceof Error ? error.message : "Error loading contract");
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar sub-contratos
  const loadSubContracts = async () => {
    if (!contractId) return;

    try {
      setSubContractsLoading(true);
      console.log("📥 LOADING SUB-CONTRACTS for contract:", contractId);

      const subContractsResponse = await getSubContractsByContractId(contractId);
      
      if (subContractsResponse.ok) {
        const subContractsResult = await subContractsResponse.json();
        console.log("✅ Sub-contracts data loaded successfully:", subContractsResult);
        
        // Procesar los datos de sub-contratos como en PurchaseContractDetail
        const processedSubContracts = subContractsResult.data?.map((item: any) => ({
          ...item,
          id: item._id, // Asegurar que tiene un ID
        })) || [];
        
        setSubContracts(processedSubContracts);
      } else {
        console.error("Error loading sub-contracts:", subContractsResponse.status);
        setSubContracts([]);
      }
    } catch (error) {
      console.error("Error loading sub-contracts:", error);
      setSubContracts([]);
    } finally {
      setSubContractsLoading(false);
    }
  };

  // Función para refrescar completamente los datos
  const handleFullRefresh = async () => {
    console.log("🔄 FULL REFRESH: Starting complete data refresh");
    await Promise.all([
      loadContractData(),
      loadSubContracts(),
    ]);
    console.log("✅ FULL REFRESH: Complete");
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (contractId) {
      loadContractData();
      loadSubContracts();
    }
  }, [contractId]);

  // Persistir el tab activo
  useEffect(() => {
    updateState({ activeTab });
  }, [activeTab]);

  // Funciones para eliminar contratos
  const handleDeleteContract = async () => {
    if (!contractToDelete) return;

    try {
      setOperationLoading(true);
      await deleteContract(contractToDelete);
      
      console.log("✅ Contract deleted successfully");
      setDeleteDialogOpen(false);
      setContractToDelete(null);
      
      // Navegar de vuelta a la lista
      setLocation("/sale-contracts");
    } catch (error) {
      console.error("❌ Error deleting contract:", error);
      // Aquí podrías mostrar un toast de error
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteSubContract = async () => {
    if (!subContractToDelete || !contractId) return;

    try {
      setOperationLoading(true);
      await deleteSubContract(subContractToDelete);
      
      console.log("✅ Sub-contract deleted successfully");
      setDeleteSubDialogOpen(false);
      setSubContractToDelete(null);
      
      // Recargar sub-contratos
      await loadSubContracts();
    } catch (error) {
      console.error("❌ Error deleting sub-contract:", error);
    } finally {
      setOperationLoading(false);
    }
  };

  // Funciones para settlement
  const handleSettleContract = async () => {
    if (!contractToSettle) return;

    try {
      setIsSettling(true);
      await settleParentContract(contractToSettle);
      
      console.log("✅ Contract settled successfully");
      setSettleDialogOpen(false);
      setContractToSettle(null);
      
      // Recargar datos del contrato
      await loadContractData();
    } catch (error) {
      console.error("❌ Error settling contract:", error);
    } finally {
      setIsSettling(false);
    }
  };

  const handleSettleSubContract = async () => {
    if (!subContractToSettle) return;

    try {
      setIsSettling(true);
      await settleSubContract(subContractToSettle);
      
      console.log("✅ Sub-contract settled successfully");
      setSettleSubDialogOpen(false);
      setSubContractToSettle(null);
      
      // Recargar sub-contratos y contrato principal
      await Promise.all([loadSubContracts(), loadContractData()]);
    } catch (error) {
      console.error("❌ Error settling sub-contract:", error);
    } finally {
      setIsSettling(false);
    }
  };

  // Funciones para navegación
  const navigateToCreateSubContract = () => {
    // Limpiar estado anterior
    dispatch(updateCreateSubContractState({ 
      formData: {}, 
      currentStep: 1, 
      completedSteps: [] 
    }));
    
    setLocation(`/sale-contracts/${contractId}/sub-contracts/create`);
  };

  const navigateToEditSubContract = (subContractId: string) => {
    // Limpiar estado anterior
    dispatch(updateEditSubContractState({ 
      formData: {}, 
      currentStep: 1, 
      completedSteps: [] 
    }));
    
    setLocation(`/sale-contracts/${contractId}/sub-contracts/${subContractId}/edit`);
  };

  const navigateToViewSubContract = (subContractId: string) => {
    setLocation(`/sale-contracts/${contractId}/sub-contracts/${subContractId}/view`);
  };

  if (loading) {
    return (
      <DashboardLayout title={t("saleContractDetail")}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !contract) {
    return (
      <DashboardLayout title={t("saleContractDetail")}>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <X className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t("contractNotFound")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || t("contractNotFoundDescription")}
          </p>
          <Link href="/sale-contracts">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("backToContracts")}
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Obtener información de participantes
  const seller = contract.participants?.find((p) => p.role === "seller");
  const buyer = contract.participants?.find((p) => p.role === "buyer");
  const trader = contract.participants?.find((p) => p.role === "trader");

  // Calcular progreso de entrega
  const totalQuantity = contract.quantity || 0;
  const deliveredQuantity = Array.isArray(subContracts) ? subContracts.reduce(
    (sum, sub) => sum + (sub.quantity || 0),
    0,
  ) : 0;
  const deliveryProgress = totalQuantity > 0 ? (deliveredQuantity / totalQuantity) * 100 : 0;

  return (
    <DashboardLayout title={t("saleContractDetail")}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/sale-contracts">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("back")}
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {contract.folio || t("saleContract")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {seller?.name} → {buyer?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFullRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {t("refresh")}
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              {t("print")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setContractToDelete(contractId!);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("delete")}
            </Button>
          </div>
        </div>

        {/* Status y Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("status")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-sm">
                {contract.status || t("active")}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("quantity")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber({
                  value: totalQuantity,
                  minDecimals: 2,
                  maxDecimals: 2,
                  formatPattern: "0,000.00",
                  roundMode: "truncate",
                })}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {contract.measurement_unit}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("delivered")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatNumber({
                  value: deliveredQuantity,
                  minDecimals: 2,
                  maxDecimals: 2,
                  formatPattern: "0,000.00",
                  roundMode: "truncate",
                })}
              </p>
              <Progress value={deliveryProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("price")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${formatNumber({
                  value: contract.price_schedule?.[0]?.price || 0,
                  minDecimals: 2,
                  maxDecimals: 4,
                  formatPattern: "0,000.00",
                  roundMode: "truncate",
                })}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {contract.price_schedule?.[0]?.payment_currency || "USD"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="general">{t("general")}</TabsTrigger>
            <TabsTrigger value="participants">{t("participants")}</TabsTrigger>
            <TabsTrigger value="subcontracts">
              {t("subContracts")} ({subContracts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contract Information */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("contractInformation")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {t("contractDate")}
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {contract.contract_date ? 
                          new Date(contract.contract_date).toLocaleDateString() : 
                          t("notSpecified")
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {t("referenceNumber")}
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {contract.reference_number || contract.folio || t("notSpecified")}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t("commodity")}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {contract.commodity?.name || t("notSpecified")}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {t("shippingStartDate")}
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {contract.shipping_start_date ? 
                          new Date(contract.shipping_start_date).toLocaleDateString() : 
                          t("notSpecified")
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {t("shippingEndDate")}
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {contract.shipping_end_date ? 
                          new Date(contract.shipping_end_date).toLocaleDateString() : 
                          t("notSpecified")
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price Information */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("priceInformation")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contract.price_schedule?.map((price, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {t("pricingType")}
                        </p>
                        <Badge 
                          variant={price.pricing_type === "basis" ? "secondary" : "default"}
                          className={
                            price.pricing_type === "basis" 
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100" 
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                          }
                        >
                          {price.pricing_type === "basis" ? t("basis") : t("fixed")}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {t("price")}
                          </p>
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">
                            ${formatNumber({
                              value: price.price || 0,
                              minDecimals: 2,
                              maxDecimals: 4,
                              formatPattern: "0,000.00",
                              roundMode: "truncate",
                            })}
                          </p>
                        </div>
                        {price.pricing_type === "basis" && (
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {t("basis")}
                            </p>
                            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                              ${formatNumber({
                                value: price.basis || 0,
                                minDecimals: 2,
                                maxDecimals: 4,
                                formatPattern: "0,000.00",
                                roundMode: "truncate",
                              })}
                            </p>
                          </div>
                        )}
                      </div>

                      {price.pricing_type === "basis" && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {t("futurePrice")}
                            </p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              ${formatNumber({
                                value: price.future_price || 0,
                                minDecimals: 2,
                                maxDecimals: 4,
                                formatPattern: "0,000.00",
                                roundMode: "truncate",
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {t("optionMonth")}
                            </p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {price.option_month} {price.option_year}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="participants" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Seller Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {t("seller")}
                    <Badge variant="outline">{t("seller")}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {t("name")}
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {seller?.name || t("notSpecified")}
                      </p>
                    </div>
                    {seller?.people_id && participantAddress[seller.people_id] && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {t("address")}
                        </p>
                        <div className="text-gray-900 dark:text-white">
                          {participantAddress[seller.people_id].address_line_1 && (
                            <p>{participantAddress[seller.people_id].address_line_1}</p>
                          )}
                          {participantAddress[seller.people_id].city?.name && (
                            <p>
                              {participantAddress[seller.people_id].city.name}
                              {participantAddress[seller.people_id].state?.name && 
                                `, ${participantAddress[seller.people_id].state.name}`
                              }
                              {participantAddress[seller.people_id].country?.name && 
                                `, ${participantAddress[seller.people_id].country.name}`
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Buyer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {t("buyer")}
                    <Badge variant="outline">{t("buyer")}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {t("name")}
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {buyer?.name || t("notSpecified")}
                      </p>
                    </div>
                    {buyer?.people_id && participantAddress[buyer.people_id] && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {t("address")}
                        </p>
                        <div className="text-gray-900 dark:text-white">
                          {participantAddress[buyer.people_id].address_line_1 && (
                            <p>{participantAddress[buyer.people_id].address_line_1}</p>
                          )}
                          {participantAddress[buyer.people_id].city?.name && (
                            <p>
                              {participantAddress[buyer.people_id].city.name}
                              {participantAddress[buyer.people_id].state?.name && 
                                `, ${participantAddress[buyer.people_id].state.name}`
                              }
                              {participantAddress[buyer.people_id].country?.name && 
                                `, ${participantAddress[buyer.people_id].country.name}`
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Trader Information (if exists) */}
              {trader && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {t("trader")}
                      <Badge variant="outline">{t("trader")}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {t("name")}
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {trader?.name || t("notSpecified")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="subcontracts" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("subContracts")}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {subContracts.length} {t("subContracts").toLowerCase()}
                </p>
              </div>
              <Button onClick={navigateToCreateSubContract}>
                <Plus className="h-4 w-4 mr-2" />
                {t("createSubContract")}
              </Button>
            </div>

            <SubContractsSection
              subContracts={subContracts}
              onEdit={navigateToEditSubContract}
              onView={navigateToViewSubContract}
              onDelete={(subContractId) => {
                setSubContractToDelete(subContractId);
                setDeleteSubDialogOpen(true);
              }}
              onSettle={(subContractId) => {
                setSubContractToSettle(subContractId);
                setSettleSubDialogOpen(true);
              }}
              loading={subContractsLoading}
              contractType="sale"
            />
          </TabsContent>
        </Tabs>

        {/* Delete Contract Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("deleteContract")}</DialogTitle>
              <DialogDescription>
                {t("deleteContractConfirmation")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={operationLoading}
              >
                {t("cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteContract}
                disabled={operationLoading}
              >
                {operationLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                {t("delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Sub-Contract Dialog */}
        <Dialog open={deleteSubDialogOpen} onOpenChange={setDeleteSubDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("deleteSubContract")}</DialogTitle>
              <DialogDescription>
                {t("deleteSubContractConfirmation")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteSubDialogOpen(false)}
                disabled={operationLoading}
              >
                {t("cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteSubContract}
                disabled={operationLoading}
              >
                {operationLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                {t("delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Settle Contract Dialog */}
        <Dialog open={settleDialogOpen} onOpenChange={setSettleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("settleContract")}</DialogTitle>
              <DialogDescription>
                {t("settleContractConfirmation")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSettleDialogOpen(false)}
                disabled={isSettling}
              >
                {t("cancel")}
              </Button>
              <Button
                onClick={handleSettleContract}
                disabled={isSettling}
              >
                {isSettling ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {t("settle")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Settle Sub-Contract Dialog */}
        <Dialog open={settleSubDialogOpen} onOpenChange={setSettleSubDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("settleSubContract")}</DialogTitle>
              <DialogDescription>
                {t("settleSubContractConfirmation")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSettleSubDialogOpen(false)}
                disabled={isSettling}
              >
                {t("cancel")}
              </Button>
              <Button
                onClick={handleSettleSubContract}
                disabled={isSettling}
              >
                {isSettling ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {t("settle")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}