import React from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PurchaseContractForm } from "@/components/PurchaseContractForm/PurchaseContractForm";

export default function CreateSaleContract() {
  const { t } = useTranslation();

  return (
    <DashboardLayout title={t("createSaleContract")}>
      <PurchaseContractForm contractType="sale" mode="create" />
    </DashboardLayout>
  );
}
