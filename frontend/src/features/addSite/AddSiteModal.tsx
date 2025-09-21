import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Box } from "@mui/material";
import { Modal, FormTextField, FormCheckbox, useToast } from "@shared/ui";
import { createSite, updateSite } from "@entities/site";
import { AppDispatch } from "@app/store";
import { SiteDto, CreateSiteDto } from "@shared/types";

interface AddSiteModalProps {
  open: boolean;
  onClose: () => void;
  site?: SiteDto | null;
}

export const AddSiteModal: React.FC<AddSiteModalProps> = ({
  open,
  onClose,
  site,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState<CreateSiteDto>({
    name: site?.name || "",
    url: site?.url || "",
    environment: site?.environment || "",
    intervalSec: site?.intervalSec || 60,
    timeoutSec: site?.timeoutSec || 5,
    degradationThresholdMs: site?.degradationThresholdMs || 2000,
    enabled: site?.enabled ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleInputChange =
    (field: keyof CreateSiteDto) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.type === "number"
          ? parseInt(event.target.value) || 0
          : event.target.value;

      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: "",
        }));
      }
    };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (site) {
        // Обновить существующий сайт
        await dispatch(
          updateSite({
            id: site.id,
            data: formData,
          })
        ).unwrap();
        showSuccess("Сайт успешно обновлён");
      } else {
        // Создать новый сайт
        await dispatch(createSite(formData)).unwrap();
        showSuccess("Сайт успешно создан");
      }
      onClose();
      resetForm();
    } catch (error) {
      showError("Не удалось сохранить сайт");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      url: "",
      environment: "",
      intervalSec: 60,
      timeoutSec: 5,
      degradationThresholdMs: 2000,
      enabled: true,
    });
    setErrors({});
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={site ? "Редактировать сайт" : "Добавить новый сайт"}
      actions={
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Отмена
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? "Сохранение..." : site ? "Обновить" : "Создать"}
          </Button>
        </Box>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <FormTextField
          label="Название сайта"
          value={formData.name}
          onChange={handleInputChange("name")}
          error={errors.name}
          placeholder="Введите название сайта"
        />

        <FormTextField
          label="URL"
          value={formData.url}
          onChange={handleInputChange("url")}
          error={errors.url}
          placeholder="https://example.com"
        />

        <FormTextField
          label="Категория"
          value={formData.environment}
          onChange={handleInputChange("environment")}
          error={errors.environment}
          placeholder="production, staging, development"
        />

        <FormTextField
          label="Интервал проверки (секунды)"
          type="number"
          value={formData.intervalSec}
          onChange={handleInputChange("intervalSec")}
          error={errors.intervalSec}
          helperText="Как часто проверять сайт (минимум 10 секунд)"
        />

        <FormTextField
          label="Таймаут (секунды)"
          type="number"
          value={formData.timeoutSec}
          onChange={handleInputChange("timeoutSec")}
          error={errors.timeoutSec}
          helperText="Максимальное время ожидания ответа (минимум 1 секунда)"
        />

        <FormTextField
          label="Порог деградации (мс)"
          type="number"
          value={formData.degradationThresholdMs}
          onChange={handleInputChange("degradationThresholdMs")}
          error={errors.degradationThresholdMs}
          helperText="Порог времени ответа для статуса деградации (минимум 100мс)"
        />

        <FormCheckbox
          label="Включить мониторинг"
          checked={formData.enabled}
          onChange={handleInputChange("enabled")}
        />
      </Box>
    </Modal>
  );
};
