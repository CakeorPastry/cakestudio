local player = game.Players.LocalPlayer
local runService = game:GetService("RunService")
local playerGui = player:WaitForChild("PlayerGui")

-- GUI Setup
-- local screenGui = Instance.new("ScreenGui", playerGui)
local screenGui = Instance.new("ScreenGui", game.CoreGui)
screenGui.ResetOnSpawn = false

local frame = Instance.new("Frame", screenGui)
frame.Size = UDim2.new(0, 150, 0, 80)
frame.Position = UDim2.new(0, 10, 0.5, -40)
frame.BackgroundColor3 = Color3.new(0.1, 0.1, 0.1)
frame.Active = true
frame.Draggable = true

local mainButton = Instance.new("TextButton", frame)
mainButton.Size = UDim2.new(1, -10, 0, 30)
mainButton.Position = UDim2.new(0, 5, 0, 5)
mainButton.Text = "Main: OFF"
mainButton.BackgroundColor3 = Color3.new(0.2, 0.2, 0.2)
mainButton.TextColor3 = Color3.new(1, 1, 1)

local allButton = Instance.new("TextButton", frame)
allButton.Size = UDim2.new(1, -10, 0, 30)
allButton.Position = UDim2.new(0, 5, 0, 40)
allButton.Text = "All: OFF"
allButton.BackgroundColor3 = Color3.new(0.2, 0.2, 0.2)
allButton.TextColor3 = Color3.new(1, 1, 1)

local mainEnabled, allEnabled = false, false

-- Utility functions
local function isFolderMatch(name)
	return name:gsub("[%d%-]", "") == ""
end

local function isAllMatch(name)
	return name:match("^%d+$")
end

local function hasItemScript(obj)
	return obj:FindFirstChild("ItemPickupScript") and obj.ItemPickupScript:IsA("Script")
end

-- ESP Application
local function applyESP(obj)
	if not obj:IsA("BasePart") then return end

	-- BillboardGui: parented to PlayerGui
	if not playerGui:FindFirstChild("ESP_Billboards") then
		local folder = Instance.new("Folder", playerGui)
		folder.Name = "ESP_Billboards"
	end
	local billboardFolder = playerGui:FindFirstChild("ESP_Billboards")

	if not obj:FindFirstChild("ESP_Highlight") then
		local highlight = Instance.new("Highlight")
		highlight.Name = "ESP_Highlight"
		highlight.DepthMode = Enum.HighlightDepthMode.AlwaysOnTop
		highlight.FillColor = hasItemScript(obj) and Color3.fromRGB(0, 255, 0) or Color3.fromRGB(255, 0, 0)
		highlight.OutlineColor = Color3.new(1, 1, 1)
		highlight.Parent = obj
	end

	if not billboardFolder:FindFirstChild(obj:GetFullName()) then
		local billboard = Instance.new("BillboardGui")
		billboard.Name = obj:GetFullName()
		billboard.Size = UDim2.new(0, 100, 0, 25)
		billboard.AlwaysOnTop = true
		billboard.StudsOffset = Vector3.new(0, 2, 0)
		billboard.Adornee = obj
		billboard.Parent = billboardFolder

		local label = Instance.new("TextLabel")
		label.Size = UDim2.new(1, 0, 1, 0)
		label.BackgroundTransparency = 1
		label.TextColor3 = Color3.new(1, 1, 1)
		label.TextStrokeTransparency = 0
		label.TextScaled = true
		label.Font = Enum.Font.SourceSansBold
		label.Text = obj.Name .. (hasItemScript(obj) and " (Item)" or "")
		label.Parent = billboard
	end
end

-- Cleanup
local function removeESP()
	if playerGui:FindFirstChild("ESP_Billboards") then
		playerGui.ESP_Billboards:Destroy()
	end
	for _, desc in ipairs(workspace:GetDescendants()) do
		if desc:IsA("BasePart") then
			local h = desc:FindFirstChild("ESP_Highlight")
			if h then h:Destroy() end
		end
	end
end

-- Update loop
runService.RenderStepped:Connect(function()
	if not (mainEnabled or allEnabled) then return end

	for _, obj in ipairs(workspace:GetChildren()) do
		if mainEnabled and obj:IsA("Folder") and isFolderMatch(obj.Name) then
			for _, child in ipairs(obj:GetChildren()) do
				applyESP(child)
			end
		end

		if allEnabled and obj:IsA("BasePart") and isAllMatch(obj.Name) then
			applyESP(obj)
		end
	end
end)

-- Button toggles
mainButton.MouseButton1Click:Connect(function()
	mainEnabled = not mainEnabled
	mainButton.Text = "Main: " .. (mainEnabled and "ON" or "OFF")
	if not (mainEnabled or allEnabled) then removeESP() end
end)

allButton.MouseButton1Click:Connect(function()
	allEnabled = not allEnabled
	allButton.Text = "All: " .. (allEnabled and "ON" or "OFF")
	if not (mainEnabled or allEnabled) then removeESP() end
end)