import React, { Component } from 'react';
import type { ErrorInfo } from 'react';
import { useState, useEffect, useRef } from 'react';
import {
  User,
  Star,
  MapPin,
  Calendar,
  Shield,
  CreditCard,
  UserCircle,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import TopBar from '../../../components/TopBar';
import iconMoto from '../../../assets/iconmoto.png';
import { postLicense, postSoat, postTechnicalReview, approveRequest, updateLicenseExpiry, updateSoatExpiry, updateTechnicalReviewExpiry } from '../../../services/DriverService';
import { disableMyAccount } from '../../../services/DriverService';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getDriverProfile, updateDriverProfile } from '../driverSlice';

interface DriverData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage: string;
  rating: number;
  totalTrips: number;
  earnings: number;
  memberSince: string;
  licenseNumber: string;
  dni: string;
  vehicleInfo: {
    type: string;
    motorCc: string;
    year: string;
    plate: string;
    color: string;
    chassisNumber: string;
  };
  technicalReview?: {
    reviewDate?: string;
    expiresAt?: string;
    passed?: boolean;
    needsRenewal?: boolean;
  };
  licenseIssueDate: string;
  licenseExpiryDate: string;
  licenseStatus: string;
  soatNumber: string;
  soatExpiryDate: string;
  soatInsurer: string;
  soatCertificate: string;
  status: 'active' | 'inactive' | 'busy';
  achievements: string[];
}

/* Navbar is now provided by shared TopBar component */

const DriverProfile: React.FC = () => {
  /* const [isEditing, setIsEditing] = useState(false); */
  const [profileData, setProfileData] = useState<DriverData>({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profileImage: '',
    rating: 0,
    totalTrips: 0,
    earnings: 0,
    memberSince: '',
    licenseNumber: '',
    dni: '',
    vehicleInfo: {
      type: '',
      motorCc: '',
      year: '',
      plate: '',
      color: '',
      chassisNumber: ''
    },
    licenseIssueDate: '',
    licenseExpiryDate: '',
    licenseStatus: 'Vigente',
    soatNumber: '',
    soatExpiryDate: '',
    soatInsurer: '',
    soatCertificate: '',
    status: 'inactive',
    achievements: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ visible: boolean; status: 'idle'|'loading'|'success'|'error'; message: string }>({ visible: false, status: 'idle', message: '' });
  const [pendingDocuments, setPendingDocuments] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const dispatch = useAppDispatch();
  const storedProfile = useAppSelector(s => s.driver.profile);
  const storeLoading = useAppSelector(s => s.driver.loadingProfile);
  const originalProfileRef = useRef<any>(null);
  
  // helper debug: show thunk reference (kept for dev) and provide quick notice

  useEffect(() => {
    // fetch profile into redux on mount
    dispatch(getDriverProfile() as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when store profile changes, populate local editable state and pending docs
  useEffect(() => {
    if (storedProfile) {
      // normalize incoming dates so date inputs receive YYYY-MM-DD and displays are friendly
      const sp: any = storedProfile as any;
      // DEBUG: print entire stored profile and raw payload coming from the API
      try {
       /*  console.log('[DriverProfile] storedProfile (redux):', sp);
        console.log('[DriverProfile] storedProfile.raw:', sp.raw ?? null);
        console.log('[DriverProfile] storedProfile.raw.user:', sp.raw?.user ?? null);
        console.log('[DriverProfile] storedProfile.raw.driver:', sp.raw?.driver ?? null);
        console.log('[DriverProfile] storedProfile.raw.motorcycle:', sp.raw?.motorcycle ?? null);
        console.log('[DriverProfile] storedProfile.raw.technical_review:', sp.raw?.technical_review ?? sp.raw?.technicalReview ?? null); */
      } catch (e) {
        console.warn('[DriverProfile] error printing storedProfile debug logs', e);
      }
      const toInputDate = (d: any) => {
        try {
          if (!d) return undefined;
          const dt = new Date(d);
          if (isNaN(dt.getTime())) return undefined;
          return dt.toISOString().slice(0, 10);
        } catch (e) { return undefined; }
      };

      const normalized: any = { ...(sp as any) };
      // ensure dni is populated from raw user object if available
      normalized.dni = sp.dni ?? sp.raw?.user?.dni ?? sp.raw?.dni ?? sp.user?.dni ?? normalized.dni;
      // only overwrite date fields when we have a valid value
      const soatExpiry = toInputDate(sp.soatExpiryDate ?? sp.raw?.motorcycle?.soat_expiry_date ?? sp.raw?.motorcycle?.soatExpiryDate);
      if (soatExpiry) normalized.soatExpiryDate = soatExpiry;

      const licenseIssue = toInputDate(sp.licenseIssueDate ?? sp.raw?.driver?.license_issue_date ?? sp.raw?.driver?.license_info?.issue_date);
      if (licenseIssue) normalized.licenseIssueDate = licenseIssue;

      const licenseExpiry = toInputDate(sp.licenseExpiryDate ?? sp.raw?.driver?.license_expiry_date ?? sp.raw?.driver?.license_info?.expiration_date ?? sp.raw?.driver?.license_info?.expires_at);
      if (licenseExpiry) normalized.licenseExpiryDate = licenseExpiry;

      // determine license status based on expiry proximity
      try {
        if (normalized.licenseExpiryDate) {
          const exp = new Date(normalized.licenseExpiryDate);
          const today = new Date();
          const diffMs = exp.getTime() - today.getTime();
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          if (diffDays < 0) normalized.licenseStatus = 'Vencida';
          else if (diffDays <= 30) normalized.licenseStatus = 'Por vencer';
          else normalized.licenseStatus = 'Vigente';
        }
      } catch (e) {
        // ignore
      }

      // technical review dates
      const tr = sp.technicalReview ?? sp.raw?.technical_review ?? {};
      const trReview = toInputDate(tr.review_date ?? tr.reviewDate ?? sp.raw?.motorcycle?.technical_review_date);
      const trExpires = toInputDate(tr.expires_at ?? tr.expiresAt ?? sp.raw?.motorcycle?.technical_review_expires_at ?? '');
      normalized.technicalReview = {
        reviewDate: trReview ?? (sp.technicalReview?.reviewDate ?? undefined),
        expiresAt: trExpires ?? (sp.technicalReview?.expiresAt ?? undefined),
        passed: tr.passed ?? sp.technicalReview?.passed ?? null,
        needsRenewal: tr.needsRenewal ?? sp.technicalReview?.needsRenewal ?? false,
      };

      // map trips / rating from multiple possible shapes returned by API
      const totalTrips = sp.totalTrips ?? sp.total_trips ?? sp.raw?.totalTrips ?? sp.raw?.tripsCount ?? sp.raw?.trips_count ?? normalized.totalTrips ?? 0;
      const rating = sp.rating ?? sp.avgRating ?? sp.raw?.rating ?? sp.raw?.avg_rating ?? normalized.rating ?? 0;

      setProfileData(prev => ({
        ...prev,
        ...normalized,
        totalTrips: totalTrips ?? prev.totalTrips,
        rating: rating ?? prev.rating,
        vehicleInfo: {
          ...(prev.vehicleInfo || {}),
          ...(normalized.vehicleInfo || {})
        },
        technicalReview: {
          ...(prev.technicalReview || {}),
          ...(normalized.technicalReview || {})
        }
      } as DriverData));
      // keep a copy of the original normalized profile to compare changes later
      originalProfileRef.current = normalized;
      if (sp.raw?.pendingDocuments) setPendingDocuments(sp.raw.pendingDocuments);

      // generate alerts for notifications area
      const newAlerts: string[] = [];
      if (normalized.licenseExpiryDate) {
        const exp = new Date(normalized.licenseExpiryDate);
        const today = new Date();
        const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) newAlerts.push('Tu licencia está vencida');
        else if (diffDays <= 30) newAlerts.push('Tu licencia está por vencer');
      }
      const soatExp = normalized.soatExpiryDate ?? sp.raw?.motorcycle?.soat_expiry_date;
      if (soatExp) {
        const exp = new Date(soatExp);
        const diffDays = Math.ceil((exp.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) newAlerts.push('Tu SOAT está vencido');
        else if (diffDays <= 30) newAlerts.push('Tu SOAT está por vencer');
      }
      if (normalized.technicalReview?.needsRenewal) newAlerts.push('Tu revisión técnica necesita atención');
      setAlerts(newAlerts);
    }
    // keep loading flag synced
    setLoadingProfile(storeLoading);
  }, [storedProfile, storeLoading]);

  // Auto-save license expiry date when changed
  useEffect(() => {
    if (!originalProfileRef.current) return;
    const original = originalProfileRef.current.licenseExpiryDate ?? '';
    const current = profileData.licenseExpiryDate ?? '';
    if (original !== current && current !== '') {
      const timer = setTimeout(async () => {
        try {
          await updateLicenseExpiry(current);
          setNotification({ visible: true, status: 'success', message: 'Fecha de licencia actualizada' });
        } catch (err: any) {
          setNotification({ visible: true, status: 'error', message: 'Error al actualizar fecha de licencia' });
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [profileData.licenseExpiryDate]);

  // Auto-save SOAT expiry date when changed
  useEffect(() => {
    if (!originalProfileRef.current) return;
    const original = originalProfileRef.current.soatExpiryDate ?? '';
    const current = profileData.soatExpiryDate ?? '';
    if (original !== current && current !== '') {
      const timer = setTimeout(async () => {
        try {
          await updateSoatExpiry(current);
          setNotification({ visible: true, status: 'success', message: 'Fecha de SOAT actualizada' });
        } catch (err: any) {
          setNotification({ visible: true, status: 'error', message: 'Error al actualizar fecha de SOAT' });
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [profileData.soatExpiryDate]);

  // Auto-save technical review expiry date when changed
  useEffect(() => {
    if (!originalProfileRef.current) return;
    const original = originalProfileRef.current.technicalReview?.expiresAt ?? '';
    const current = profileData.technicalReview?.expiresAt ?? '';
    if (original !== current && current !== '') {
      const timer = setTimeout(async () => {
        try {
          await updateTechnicalReviewExpiry(current);
          setNotification({ visible: true, status: 'success', message: 'Fecha de revisión técnica actualizada' });
        } catch (err: any) {
          setNotification({ visible: true, status: 'error', message: 'Error al actualizar fecha de revisión técnica' });
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [profileData.technicalReview?.expiresAt]);

  

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // accept avif explicitly as well as other image types
    if (!file.type.startsWith('image/') && !file.name.toLowerCase().endsWith('.avif')) {
      alert('El archivo debe ser una imagen (jpg, png, webp, avif, ...).');
      return;
    }

    // Preview using object URL (better support for modern formats like .avif)
    const url = URL.createObjectURL(file);
    setProfileData(prev => ({ ...prev, profileImage: url }));

    // Upload to backend (fire-and-forget, then refresh canonical URL)
    (async () => {
      try {
        const fd = new FormData();
        fd.append('profile_image', file);
        // dynamic import to avoid circular deps
        const { uploadProfilePhoto } = await import('../../../services/DriverService');
        const res = await uploadProfilePhoto(fd as any);
        if (res && res.profile_image) {
          // refresh profile from server to get the canonical URL (which may be served under /uploads)
          await dispatch(getDriverProfile() as any);
        }
      } catch (err) {
        console.error('Failed to upload profile photo', err);
        alert('No se pudo subir la foto de perfil');
      } finally {
        // revoke object URL after a short delay to allow browser to show it
        setTimeout(() => { try { URL.revokeObjectURL(url); } catch (e) {} }, 5000);
      }
    })();
  };

  // helper to convert server relative paths to absolute URLs
  const resolveImageUrl = (img?: string | null) => {
    if (!img) return undefined;
    try {
      if (img.startsWith('http') || img.startsWith('data:')) return img;
      if (img.startsWith('/')) return `${window.location.origin}${img}`;
      // some backends may return relative without leading slash
      return `${window.location.origin}/${img}`;
    } catch (e) { return img; }
  };

  // Document upload modal state
  const [docModalOpen, setDocModalOpen] = useState<boolean>(false);
  const [docType, setDocType] = useState<'license' | 'soat' | 'technical' | null>(null);
  const [docForm, setDocForm] = useState<Record<string, any>>({});
  const [docFile, setDocFile] = useState<File | null>(null);

  // Disable account confirmation modal
  const [confirmDisableOpen, setConfirmDisableOpen] = useState<boolean>(false);
  const [isDisabling, setIsDisabling] = useState<boolean>(false);

  const openDocModal = (type: 'license' | 'soat' | 'technical') => {
    setDocType(type);
    // Pre-fill fields based on document type
    if (type === 'license') {
      setDocForm({ 
        license_number: profileData.licenseNumber ?? '',
        issue_date: profileData.licenseIssueDate ?? '',
        expiration_date: profileData.licenseExpiryDate ?? ''
      });
    } else if (type === 'soat') {
      setDocForm({ 
        vehicle_plate: profileData.vehicleInfo.plate ?? '', 
        insurance_policy: profileData.soatNumber ?? '',
        expiration_date: profileData.soatExpiryDate ?? ''
      });
    } else if (type === 'technical') {
      setDocForm({ 
        plate: profileData.vehicleInfo.plate ?? '',
        review_date: profileData.technicalReview?.reviewDate ?? '',
        expires_at: profileData.technicalReview?.expiresAt ?? '',
        passed: profileData.technicalReview?.passed ?? false
      });
    }
    setDocFile(null);
    setDocModalOpen(true);
  };

  const handleDocInput = (key: string, value: any) => {
    setDocForm(prev => ({ ...prev, [key]: value }));
  };

  const handleDocFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    // basic client-side validation for license photos: require image and reasonable size
    if (file) {
      // license and technical reviews: images only, max 6MB
      if (docType === 'license' || docType === 'technical') {
        if (!file.type.startsWith('image/') && !file.name.toLowerCase().endsWith('.avif')) {
          alert('El archivo debe ser una imagen (jpg, png, avif, ...).');
          return;
        }
        if (file.size > 6 * 1024 * 1024) {
          alert('La imagen debe pesar menos de 6MB.');
          return;
        }
      }
      // SOAT: allow images or PDF (user may upload a scanned PDF); max 8MB
      if (docType === 'soat') {
        const okType = file.type.startsWith('image/') || file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        if (!okType) {
          alert('El archivo de SOAT debe ser una imagen o PDF.');
          return;
        }
        if (file.size > 8 * 1024 * 1024) {
          alert('El archivo de SOAT debe pesar menos de 8MB.');
          return;
        }
      }
    }
    setDocFile(file);
  };

  const submitDocument = async () => {
    if (!docType) return;
    try {
      // prepare form/data
      const appendMetadataToForm = (fd: FormData) => {
        Object.entries(docForm).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, String(v)); });
      };

      let responseData: any = null;
      // require file for license, soat and technical renewals (photo/document needed)
      if ((docType === 'license' || docType === 'soat' || docType === 'technical') && !docFile) {
        alert('Debes adjuntar el archivo requerido para esta solicitud (licencia/SOAT/revisión técnica).');
        return;
      }

      if (docFile) {
        const fd = new FormData();
        appendMetadataToForm(fd);
        fd.append('file', docFile);

        if (docType === 'license') responseData = await postLicense(fd);
        else if (docType === 'soat') responseData = await postSoat(fd);
        else responseData = await postTechnicalReview(fd);
      } else {
        const payload = { ...docForm };
        if (docType === 'license') responseData = await postLicense(payload as any);
        else if (docType === 'soat') responseData = await postSoat(payload as any);
        else responseData = await postTechnicalReview(payload as any);
      }

      // Normalize the returned object: some endpoints return { license: {...} }, { soat: {...} } or { review: {...} }
      const pickInserted = (res: any) => {
        if (!res) return null;
        if (res.license) return { ...res.license, _meta: { kind: 'license', message: res.message } };
        if (res.soat) return { ...res.soat, _meta: { kind: 'soat', message: res.message } };
        if (res.review) return { ...res.review, _meta: { kind: 'technical', message: res.message } };
        // fallback: the service may return the inserted object directly
        return { ...res, _meta: { kind: docType } };
      };

      const insertedRaw = pickInserted(responseData);
      if (insertedRaw) {
        // derive common fields for UI
        const insertedNormalized = {
          ...insertedRaw,
          type: insertedRaw._meta?.kind ?? (docType === 'technical' ? 'technical' : docType),
          status: insertedRaw.status ?? insertedRaw.state ?? 'Pendiente',
          requested_at: insertedRaw.requested_at ?? insertedRaw.created_at ?? insertedRaw.createdAt ?? new Date().toISOString(),
          file: insertedRaw.file ?? insertedRaw.file_path ?? insertedRaw.filePath ?? undefined
        };
        setPendingDocuments(prev => [insertedNormalized, ...prev]);
      }
      alert('Documento enviado. Quedó en estado Pendiente.');

      setDocModalOpen(false);
      setDocType(null);
      setDocForm({});
      setDocFile(null);
        // refresh profile because technical-review can update motorcycle
      await dispatch(getDriverProfile() as any);
    } catch (err: any) {
      console.error('submitDocument error', err);
      const msg = err?.response?.data?.message ?? 'Error al enviar documento';
      alert(msg);
    }
  };

  // Confirm a pending license request (validate photo visually) and apply dates to official registry
  const confirmPendingLicense = async (d: any) => {
    if (!d) return;
    if (!(d._meta?.kind === 'license' || (d.type && String(d.type).toLowerCase().includes('license')))) {
      alert('Documento no es una solicitud de licencia');
      return;
    }
    // Use the dates from the pending request when available
    const issue = d.issue_date ?? d.issueDate ?? profileData.licenseIssueDate ?? '';
    const exp = d.expiration_date ?? d.expirationDate ?? profileData.licenseExpiryDate ?? '';
    if (!issue || !exp) {
      alert('La solicitud no contiene fechas válidas para aplicar.');
      return;
    }
    try {
        setIsSaving(true);
        // Call backend approve endpoint to apply the pending license request
        await approveRequest('license', d.id);
        // mark document as applied locally
        setPendingDocuments(prev => prev.map((pd) => pd.id === d.id ? { ...pd, status: 'approved' } : pd));
        alert('Fechas aplicadas correctamente al registro oficial.');
        await dispatch(getDriverProfile() as any);
    } catch (err: any) {
      console.error('confirmPendingLicense error', err);
      alert(err?.response?.data?.message ?? err?.message ?? 'No fue posible aplicar las fechas');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmPendingSoat = async (d: any) => {
    if (!d) return;
    if (!(d._meta?.kind === 'soat' || (d.type && String(d.type).toLowerCase().includes('soat')))) {
      alert('Documento no es una solicitud de SOAT');
      return;
    }
    const policy = d.insurance_policy ?? d.insurancePolicy ?? d.policy_number ?? null;
    const exp = d.expiration_date ?? d.expirationDate ?? null;
    if (!policy || !exp) {
      alert('La solicitud no contiene número de póliza o fecha de vencimiento válidos.');
      return;
    }
    try {
        setIsSaving(true);
        // Call backend approve endpoint to apply the pending SOAT request
        await approveRequest('soat', d.id);
        setPendingDocuments(prev => prev.map((pd) => pd.id === d.id ? { ...pd, status: 'approved' } : pd));
        alert('SOAT aplicado correctamente al registro oficial.');
        await dispatch(getDriverProfile() as any);
    } catch (err: any) {
      console.error('confirmPendingSoat error', err);
      alert(err?.response?.data?.message ?? err?.message ?? 'No fue posible aplicar la póliza SOAT');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmPendingTechnical = async (d: any) => {
    if (!d) return;
    if (!(d._meta?.kind === 'technical' || (d.type && String(d.type).toLowerCase().includes('technical')) || (d.type && String(d.type).toLowerCase().includes('revisión')))) {
      alert('Documento no es una solicitud de revisión técnica');
      return;
    }
    const reviewDate = d.review_date ?? d.reviewDate ?? d.reviewDate ?? null;
    if (!reviewDate) {
      alert('La solicitud no contiene fecha de revisión válida.');
      return;
    }
    try {
        setIsSaving(true);
        // Call backend approve endpoint to insert a new technical_review record and update motorcycle
        await approveRequest('technical', d.id);
        setPendingDocuments(prev => prev.map((pd) => pd.id === d.id ? { ...pd, status: 'approved' } : pd));
        alert('Revisión técnica aplicada correctamente al registro oficial.');
        await dispatch(getDriverProfile() as any);
    } catch (err: any) {
      console.error('confirmPendingTechnical error', err);
      alert(err?.response?.data?.message ?? err?.message ?? 'No fue posible aplicar la revisión técnica');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDisable = () => {
    setConfirmDisableOpen(true);
  };

  const handleConfirmDisable = async () => {
    setIsDisabling(true);
    try {
      await disableMyAccount();
      // logout and redirect to login
      const { logout } = await import('../../../features/auth/authSlice');
      // dispatch logout synchronously
      dispatch(logout());
      // navigate to login (full reload; cannot use hook here)
      window.location.href = '/login';
    } catch (err: any) {
      console.error('Failed to disable account', err);
      alert(err?.response?.data?.error ?? err?.message ?? 'Error al deshabilitar cuenta');
    } finally {
      setIsDisabling(false);
      setConfirmDisableOpen(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof DriverData] as Record<string, any>),
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({ ...prev, [field]: value }));
    }
  };

  const getField = (key: string) => {
    if (key.includes('.')) {
      const [p, c] = key.split('.');
      return (profileData as any)[p]?.[c];
    }
    return (profileData as any)[key];
  };

  const validateAll = () => {
    // Only validate editable fields (leave documentary and unrelated fields visible but not required)
    const required = [
      'phone', 'email'
    ];

    const newErrors: Record<string,string> = {};
    for (const k of required) {
      const v = getField(k);
      if (v === undefined || v === null || String(v).trim() === '') {
        newErrors[k] = 'Campo obligatorio';
      }
    }

    // email simple validation
    const email = getField('email') as string;
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRe.test(email)) newErrors['email'] = 'Correo inválido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setIsSaving(true);
    // show loading notification
    setNotification({ visible: true, status: 'loading', message: 'Enviando solicitud de cambios...' });
    const ok = validateAll();
    if (!ok) {
      setNotification({ visible: false, status: 'idle', message: '' });
      // scroll to top of form (optional)
      const el = document.querySelector('.p-6');
      el?.scrollIntoView({ behavior: 'smooth' });
      setIsSaving(false);
      return;
    }

    try {
      const body: any = { user: { email: profileData.email, phone: profileData.phone } };

      // only include license dates if they changed
      try {
        const orig = originalProfileRef.current;
        const issueChanged = !orig || (String(profileData.licenseIssueDate ?? '') !== String(orig.licenseIssueDate ?? orig.raw?.driver?.license_info?.issue_date ?? ''));
        const expChanged = !orig || (String(profileData.licenseExpiryDate ?? '') !== String(orig.licenseExpiryDate ?? orig.raw?.driver?.license_info?.expiration_date ?? ''));
        // If there is a pending license request, require the user to validate the photo
        const hasPendingLicenseRequest = pendingDocuments.some((pd: any) => (pd._meta?.kind === 'license' || String(pd.type ?? '').toLowerCase().includes('license')) && (pd.status ?? pd.state ?? 'Pendiente').toString().toLowerCase() === 'pending');
        if ((issueChanged || expChanged) && hasPendingLicenseRequest) {
          // Do not include license date changes here; instruct user to validate and apply from pending document
          setNotification({ visible: true, status: 'error', message: 'Hay una solicitud de renovación de licencia pendiente. Valida la foto desde Documentos Pendientes para aplicar las fechas.' });
          setIsSaving(false);
          return;
        }

        if (issueChanged || expChanged) {
          body.driver = {} as any;
          if (issueChanged) body.driver.license_issue_date = profileData.licenseIssueDate ?? null;
          if (expChanged) body.driver.license_expiration_date = profileData.licenseExpiryDate ?? null;
        }
      } catch (e) {
        body.driver = { license_issue_date: profileData.licenseIssueDate ?? null, license_expiration_date: profileData.licenseExpiryDate ?? null };
      }

      // DEBUG: inspect payload sent to backend
      console.log('[DriverProfile] update payload:', body);

      // use the redux thunk so the slice handles the API call and mapping
      const result = await (dispatch(updateDriverProfile(body) as any)).unwrap();
      // thunk returns { profile, raw } (or in older shape may return profile directly)
      const data = result?.raw ?? result?.profile ?? result ?? {};

      // handle actions returned by API (if any)
      const actions = data.actions ?? {};
      if (actions.user) {
        // show small success hints for changed fields
        if (actions.user.email === 'updated') {
          // update notification message
          setNotification({ visible: true, status: 'success', message: 'Correo actualizado correctamente' });
        }
        if (actions.user.phone === 'updated') {
          setNotification({ visible: true, status: 'success', message: 'Teléfono actualizado correctamente' });
        }
      }

      // handle pending documents: show a success state indicating request queued
      if (actions.pendingDocuments || data.pendingDocuments) {
        const pd = actions.pendingDocuments ?? data.pendingDocuments;
        setPendingDocuments(pd);
        setNotification({ visible: true, status: 'success', message: 'Solicitud enviada. Pendiente de revisión.' });
      } else if (!actions.user) {
        // generic success when no pending docs and no specific user actions
        setNotification({ visible: true, status: 'success', message: 'Cambios guardados correctamente' });
      }

      // ensure store is in sync (thunk already updated profile but refresh to be safe)
      await dispatch(getDriverProfile() as any);
      setErrors({});

      // auto-hide success notification after a delay
      setTimeout(() => setNotification({ visible: false, status: 'idle', message: '' }), 3500);
    } catch (err: any) {
      console.error(err);
      const msg = err?.payload?.message ?? err?.response?.data?.message ?? err?.message ?? (typeof err === 'string' ? err : null) ?? 'Error al guardar';
      // show error notification with message
      setNotification({ visible: true, status: 'error', message: String(msg) });
      // auto-hide error after a bit
      setTimeout(() => setNotification({ visible: false, status: 'idle', message: '' }), 6000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    try {
      // reload profile from server/store to discard local edits
      await dispatch(getDriverProfile() as any);
      setErrors({});
      setDocModalOpen(false);
      setDocForm({});
      setDocFile(null);
      alert('Cambios descartados');
    } catch (e) {
      console.warn('Failed to reload profile', e);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <TopBar profileImage={profileData.profileImage} name={profileData.firstName} />
        <div className="max-w-6xl mx-auto p-8">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-lg font-medium">Cargando perfil...</p>
            <p className="text-sm text-gray-500 mt-2">Obteniendo información desde el servidor</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <TopBar profileImage={profileData.profileImage} name={profileData.firstName} />

      {/* Notification toast */}
      {notification.visible && (
        <div className="fixed right-4 top-20 z-50">
          <div className={`flex items-center space-x-3 max-w-sm w-full p-3 rounded shadow-lg border ${notification.status === 'loading' ? 'bg-white border-gray-200' : notification.status === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="w-10 h-10 flex items-center justify-center">
              {notification.status === 'loading' && <Loader2 className="w-6 h-6 text-gray-600 animate-spin" />}
              {notification.status === 'success' && <Check className="w-6 h-6 text-green-600" />}
              {notification.status === 'error' && <X className="w-6 h-6 text-red-600" />}
            </div>
            <div className="flex-1">
              <div className={`text-sm ${notification.status === 'success' ? 'text-green-800' : notification.status === 'error' ? 'text-red-800' : 'text-gray-800'}`}>{notification.message}</div>
              {notification.status === 'loading' && <div className="text-xs text-gray-500 mt-1">Cargando…</div>}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4">
        {alerts && alerts.length > 0 && (
          <div className="mb-4">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <div className="flex items-start">
                <div className="ml-2">
                  {alerts.map((a, i) => (
                    <p key={i} className="text-sm text-red-800 font-medium">{a}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {pendingDocuments && pendingDocuments.length > 0 && (
          <div className="mb-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex items-start">
                <div className="ml-2">
                  <p className="text-sm text-yellow-800 font-medium">Documentos pendientes</p>
                  <ul className="mt-2 text-sm text-yellow-700">
                    {pendingDocuments.map((d: any, idx: number) => {
                      const fp = d.file ?? d.file_path ?? d.filePath ?? null;
                      return (
                        <li key={idx} className="mb-1">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1">
                              <strong>{(d.type ?? d.document_type ?? d._meta?.kind ?? 'Documento').toString()}</strong>
                              <span className="ml-2">— {d.status ?? d.state ?? 'Pendiente'}</span>
                              {d.requested_at ? <span className="ml-2 text-xs text-yellow-800">· {new Date(d.requested_at).toLocaleDateString()}</span> : null}
                            </div>
                            {fp ? (
                              <div>
                                  <a className="text-xs underline text-yellow-800 hover:text-yellow-900 mr-3" href={fp.startsWith('http') || fp.startsWith('data:') ? fp : `${window.location.origin}${fp.startsWith('/') ? fp : '/' + fp}`} target="_blank" rel="noreferrer">Ver archivo</a>
                                  {/* If this is a license request and still pending, allow visual validation and apply dates */}
                                  {/* License */}
                                  {((d._meta?.kind === 'license') || (d.type && String(d.type).toLowerCase().includes('license'))) && ((d.status ?? d.state ?? 'Pendiente').toString().toLowerCase() === 'pending') ? (
                                    <button onClick={() => confirmPendingLicense(d)} className="text-xs bg-green-600 text-white px-2 py-1 rounded text-[12px] hover:bg-green-700">Validar y aplicar</button>
                                  ) : null}
                                  {/* SOAT */}
                                  {((d._meta?.kind === 'soat') || (d.type && String(d.type).toLowerCase().includes('soat'))) && ((d.status ?? d.state ?? 'Pendiente').toString().toLowerCase() === 'pending') ? (
                                    <button onClick={() => confirmPendingSoat(d)} className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded text-[12px] hover:bg-green-700">Validar y aplicar SOAT</button>
                                  ) : null}
                                  {/* Technical review */}
                                  {((d._meta?.kind === 'technical') || (d.type && String(d.type).toLowerCase().includes('technical')) || (d.type && String(d.type).toLowerCase().includes('revisión'))) && ((d.status ?? d.state ?? 'Pendiente').toString().toLowerCase() === 'pending') ? (
                                    <button onClick={() => confirmPendingTechnical(d)} className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded text-[12px] hover:bg-green-700">Validar y aplicar RT</button>
                                  ) : null}
                              </div>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Document Upload Modal */}
        {docModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-xl mx-4">
              <div className="p-4 border-b flex justify-between items-center">
                <h4 className="font-medium">{docType === 'license' ? 'Renovación de Licencia' : docType === 'soat' ? 'Renovación de SOAT' : 'Revisión Técnica'}</h4>
                <button onClick={() => setDocModalOpen(false)} className="text-gray-500">Cerrar</button>
              </div>
              <div className="p-4 space-y-3">
                {docType === 'license' && (
                  <>
                    <label className="block text-sm">Número de licencia</label>
                    <input className="w-full p-2 border rounded" value={docForm.license_number ?? ''} onChange={(e) => handleDocInput('license_number', e.target.value)} />
                    <label className="block text-sm">Fecha de emisión</label>
                    <input type="date" className="w-full p-2 border rounded" value={docForm.issue_date ?? ''} onChange={(e) => handleDocInput('issue_date', e.target.value)} />
                    <label className="block text-sm">Fecha de vencimiento</label>
                    <input type="date" className="w-full p-2 border rounded" value={docForm.expiration_date ?? ''} onChange={(e) => handleDocInput('expiration_date', e.target.value)} />
                  </>
                )}

                {docType === 'soat' && (
                  <>
                    <label className="block text-sm">Número de póliza</label>
                    <input className="w-full p-2 border rounded" value={docForm.insurance_policy ?? ''} onChange={(e) => handleDocInput('insurance_policy', e.target.value)} />
                    <label className="block text-sm">Fecha de vencimiento</label>
                    <input type="date" className="w-full p-2 border rounded" value={docForm.expiration_date ?? ''} onChange={(e) => handleDocInput('expiration_date', e.target.value)} />
                    <label className="block text-sm">Placa del vehículo</label>
                    <input className="w-full p-2 border rounded" value={docForm.vehicle_plate ?? profileData.vehicleInfo.plate ?? ''} onChange={(e) => handleDocInput('vehicle_plate', e.target.value)} />
                  </>
                )}

                {docType === 'technical' && (
                  <>
                    <label className="block text-sm">Placa</label>
                    <input className="w-full p-2 border rounded" value={docForm.plate ?? profileData.vehicleInfo.plate ?? ''} onChange={(e) => handleDocInput('plate', e.target.value)} />
                    <label className="block text-sm">Fecha de revisión</label>
                    <input type="date" className="w-full p-2 border rounded" value={docForm.review_date ?? ''} onChange={(e) => handleDocInput('review_date', e.target.value)} />
                    <label className="block text-sm">Vence el</label>
                    <input type="date" className="w-full p-2 border rounded" value={docForm.expires_at ?? ''} onChange={(e) => handleDocInput('expires_at', e.target.value)} />
                    <label className="inline-flex items-center mt-2"><input type="checkbox" className="mr-2" checked={!!docForm.passed} onChange={(e) => handleDocInput('passed', e.target.checked)} /> Marcó como Aprobada</label>
                    <label className="block text-sm">Notas</label>
                    <textarea className="w-full p-2 border rounded" value={docForm.notes ?? ''} onChange={(e) => handleDocInput('notes', e.target.value)} />
                  </>
                )}

                <div>
                  <label className="block text-sm">Archivo (opcional)</label>
                  <input type="file" accept="image/*,application/pdf" onChange={handleDocFile} />
                </div>
              </div>
              <div className="p-4 border-t flex justify-end space-x-2">
                <button onClick={() => setDocModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded">Cancelar</button>
                <button onClick={submitDocument} className="px-4 py-2 bg-blue-600 text-white rounded">Enviar</button>
              </div>
            </div>
          </div>
        )}
        {/* Disable account confirmation modal */}
        {confirmDisableOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
              <div className="p-4 border-b flex justify-between items-center">
                <h4 className="font-medium">¿Estás seguro de deshabilitar tu cuenta?</h4>
                <button onClick={() => setConfirmDisableOpen(false)} className="text-gray-500">Cerrar</button>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-sm text-gray-700">Al confirmar, tu cuenta será deshabilitada (no se eliminará). Podrás reactivar la cuenta registrándote nuevamente con el mismo correo o número.</p>
              </div>
              <div className="p-4 border-t flex justify-end space-x-2">
                <button onClick={() => setConfirmDisableOpen(false)} className="px-4 py-2 bg-gray-100 rounded">Cancelar</button>
                <button onClick={handleConfirmDisable} disabled={isDisabling} className="px-4 py-2 bg-red-600 text-white rounded">{isDisabling ? 'Deshabilitando...' : 'Confirmar deshabilitación'}</button>
              </div>
            </div>
          </div>
        )}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Image and Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Image */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 mx-auto overflow-hidden">
                    {profileData.profileImage ? (
                      <img 
                        src={resolveImageUrl(profileData.profileImage)} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                        <User size={48} className="text-white" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-red-700 text-white px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-red-600 transition-colors">
                    Cambiar foto de perfil
                    <input
                      type="file"
                      accept="image/*,image/avif,.avif"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <MapPin className="text-blue-600" size={20} />
                  </div>
                  <div className="text-3xl font-extrabold text-gray-800">{profileData.totalTrips ?? 0}</div>
                  <div className="text-sm text-gray-500">Viajes Completados</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                    <Star className="text-yellow-600" size={20} />
                  </div>
                  <div className="text-3xl font-extrabold text-gray-800">{profileData.rating ?? 0}</div>
                  <div className="text-sm text-gray-500">Calificación</div>
                </div>
              </div>
            </div>

            {/* Delete Account */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <button onClick={handleOpenDisable} className="w-full text-left text-red-600 hover:text-red-700 font-medium">
                ELIMINAR CUENTA
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 sm:p-6 space-y-6">
                {/* Datos Personales */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <UserCircle className="mr-2 text-green-600" size={20} />
                    Datos Personales
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      readOnly
                      className={`w-full px-3 py-2 bg-gray-200 border-none rounded-md text-gray-600 cursor-not-allowed`}
                      placeholder="Nombre"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      readOnly
                      className={`w-full px-3 py-2 bg-gray-200 border-none rounded-md text-gray-600 cursor-not-allowed`}
                      placeholder="Apellidos"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-3 py-2 bg-gray-100 border-none rounded-md focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors ${errors['phone'] ? 'border border-red-400' : ''}`}
                      placeholder="Número de teléfono"
                    />
                    {errors['phone'] && <p className="text-xs text-red-600 mt-1">{errors['phone']}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-3 py-2 bg-gray-100 border-none rounded-md focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors ${errors['email'] ? 'border border-red-400' : ''}`}
                      placeholder="correo@ejemplo.com"
                    />
                    {errors['email'] && <p className="text-xs text-red-600 mt-1">{errors['email']}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      DNI
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profileData.dni}
                        readOnly
                        className={`w-full px-3 py-2 bg-gray-200 border-none rounded-md text-gray-600 cursor-not-allowed pr-10 ${errors['dni'] ? 'border border-red-400' : ''}`}
                        placeholder="12345678"
                      />
                      {errors['dni'] && <p className="text-xs text-red-600 mt-1">{errors['dni']}</p>}
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 0 1 6 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Mototaxi Información */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <img src={iconMoto} alt="Mototaxi" className="mr-2 w-5 h-5 sm:w-6 sm:h-6 object-contain" />
                    <span>Mototaxi</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* vehicle type removed per UX request */}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Placa</label>
                      <div>
                        <input
                          type="text"
                          value={profileData.vehicleInfo.plate}
                          readOnly
                          placeholder="4417-SA"
                          className={`w-full px-3 py-2 bg-gray-200 border-none rounded-md text-gray-600 cursor-not-allowed ${errors['vehicleInfo.plate'] ? 'border-red-400' : ''}`}
                        />
                      </div>
                      {errors['vehicleInfo.plate'] && <p className="text-xs text-red-600 mt-1">{errors['vehicleInfo.plate']}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                      <input
                        type="text"
                        value={profileData.vehicleInfo.color}
                        readOnly
                        className={`w-full px-3 py-2 bg-gray-200 border-none rounded-md text-gray-600 cursor-not-allowed`}
                        placeholder="Color del vehículo"
                      />
                      {errors['vehicleInfo.color'] && <p className="text-xs text-red-600 mt-1">{errors['vehicleInfo.color']}</p>}
                    </div>
                  </div>
                </div>

                {/* SOAT Información - Seguro Obligatorio de Accidentes de Tránsito (Perú) */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <Shield className="mr-2 text-blue-600" size={20} />
                    SOAT
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Póliza
                      </label>
                      <input
                        type="text"
                        value={profileData.soatNumber}
                        readOnly
                        className="w-full px-3 py-2 bg-gray-200 border-none rounded-md text-gray-600 cursor-not-allowed"
                        placeholder="120240123456789"
                      />
                      <p className="text-xs text-gray-500 mt-1">Formato: 15 dígitos numéricos</p>
                      <div className="mt-2">
                        <button type="button" onClick={() => openDocModal('soat')} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Solicitar renovación</button>
                      </div>
                    </div>

                    {/* Compañía aseguradora removida del formulario de renovación simple de SOAT por requerimiento */}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de vencimiento
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          placeholder=""
                          value={profileData.soatExpiryDate ?? ''}
                          onChange={(e) => handleInputChange('soatExpiryDate', e.target.value)}
                          className={`w-full px-3 py-2 bg-gray-100 border-none rounded-md focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors pr-10 ${errors['soatExpiryDate'] ? 'border border-red-400' : ''}`}
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Vigencia mínima: 1 año desde la emisión</p>
                      {errors['soatExpiryDate'] && <p className="text-xs text-red-600 mt-1">{errors['soatExpiryDate']}</p>}
                    </div>

                    {/* Certificate number removed per UX request */}
                  </div>
                </div>

                  {/* Revisión Técnica */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                      <svg className="mr-2" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15 8H9L12 2Z" fill="#4B5563"/></svg>
                      Revisión Técnica
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de revisión</label>
                        <input type="date" value={profileData.technicalReview?.reviewDate ?? ''} onChange={(e) => handleInputChange('technicalReview.reviewDate', e.target.value)} className="w-full px-3 py-2 bg-gray-100 border-none rounded-md focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vence el</label>
                        <input type="date" value={profileData.technicalReview?.expiresAt ?? ''} onChange={(e) => handleInputChange('technicalReview.expiresAt', e.target.value)} className="w-full px-3 py-2 bg-gray-100 border-none rounded-md focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                        <input type="text" readOnly value={profileData.technicalReview?.passed ? 'Aprobada' : profileData.technicalReview?.needsRenewal ? 'Necesita renovación' : (profileData.technicalReview?.passed === false ? 'Reprobada' : '')} className="w-full px-3 py-2 bg-gray-200 rounded-md text-gray-600 cursor-not-allowed" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <button type="button" onClick={() => openDocModal('technical')} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Solicitar renovación</button>
                    </div>
                  </div>

                {/* Licencia Información */}
                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <CreditCard className="mr-2 text-purple-600" size={20} />
                    Licencia de Conducir
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Licencia
                      </label>
                      <input
                        type="text"
                        value={profileData.licenseNumber}
                        readOnly
                        className="w-full px-3 py-2 bg-gray-200 border-none rounded-md text-gray-600 cursor-not-allowed"
                        placeholder="L12345678"
                      />
                      <div className="mt-2">
                        <button type="button" onClick={() => openDocModal('license')} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Solicitar renovación</button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de emisión
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          placeholder=""
                          value={profileData.licenseIssueDate ?? ''}
                          onChange={(e) => handleInputChange('licenseIssueDate', e.target.value)}
                          className={`w-full px-3 py-2 bg-gray-100 border-none rounded-md focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors pr-10 ${errors['licenseIssueDate'] ? 'border border-red-400' : ''}`}
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      </div>
                      {errors['licenseIssueDate'] && <p className="text-xs text-red-600 mt-1">{errors['licenseIssueDate']}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de vencimiento
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          placeholder=""
                          value={profileData.licenseExpiryDate ?? ''}
                          onChange={(e) => handleInputChange('licenseExpiryDate', e.target.value)}
                          className={`w-full px-3 py-2 bg-gray-100 border-none rounded-md focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors pr-10 ${errors['licenseExpiryDate'] ? 'border border-red-400' : ''}`}
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      </div>
                      {errors['licenseExpiryDate'] && <p className="text-xs text-red-600 mt-1">{errors['licenseExpiryDate']}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado de licencia
                      </label>
                      <select
                        value={profileData.licenseStatus}
                        onChange={(e) => handleInputChange('licenseStatus', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-100 border-none rounded-md focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors"
                      >
                        <option value="Vigente">Vigente</option>
                        <option value="Por vencer">Por vencer</option>
                        <option value="Vencida">Vencida</option>
                        <option value="Suspendida">Suspendida</option>
                        <option value="En trámite">En trámite</option>
                        <option value="Renovación pendiente">Renovación pendiente</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Acción Buttons */}
                <div className="border-t pt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  <button onClick={handleCancel} className="w-full sm:w-auto px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`w-full sm:w-auto px-6 py-2 rounded-md transition-colors ${isSaving ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-red-900 text-white hover:bg-red-700'}`}>
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return <h2>Algo salió mal. Por favor, recarga la página.</h2>;
    }

    return this.props.children;
  }
}

const DriverProfileWithBoundary: React.FC = () => (
  <ErrorBoundary>
    <DriverProfile />
  </ErrorBoundary>
);

export default DriverProfileWithBoundary;